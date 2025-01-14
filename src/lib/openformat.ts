"use server";

import { type Chain, ChainName, getChain, getChainById } from "@/constants/chains";
import config from "@/constants/config";
import { getCommunities, getCommunity } from "@/db/queries/communities";
import axios from "axios";
import { request } from "graphql-request";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { cache } from "react";
import type { Address } from "viem";
import { getCurrentUser, getUserHandle } from "./privy";

const apiClient = axios.create({
  baseURL: config.OPENFORMAT_API_URL,
  headers: {
    "x-api-key": config.OPENFORMAT_API_KEY,
  },
});

export async function revalidate() {
  revalidatePath("/");
}

export async function getChainFromCommunityOrCookie(
  communityIdOrSlug?: string,
  chain_id?: number
): Promise<Chain | null> {
  let chain: Chain | null = null;

  if (communityIdOrSlug) {
    const community = await getCommunity(communityIdOrSlug);
    if (community?.chain_id) {
      chain = getChainById(community.chain_id);
    }
  }

  if (!chain && chain_id) {
    chain = getChainById(chain_id);
  }

  if (!chain) {
    const cookieStore = await cookies();
    const chainName = cookieStore.get("chainName");
    chain = chainName ? getChain(chainName.value as ChainName) : getChain(ChainName.ARBITRUM_SEPOLIA);
  }

  return chain;
}

export async function fetchAllCommunities() {
  const chain = await getChainFromCommunityOrCookie();

  if (!chain) {
    console.log("No chain found for chainName:", chain);
    return null;
  }

  const user = await getCurrentUser();
  const dbCommunities = await getCommunities();

  if (!user) {
    return null;
  }

  const query = `
   query ($owner: String!) {
  apps(
    where: {owner_contains_nocase: $owner}
    orderBy: createdAt
    orderDirection: desc
  ) {
    id
    name
    owner {
      id
    }
  }
}
  `;
  const data = await request<{
    apps: { id: string; name: string; owner: { id: string } }[];
  }>(chain.SUBGRAPH_URL, query, {
    owner: user.wallet_address,
  });

  // Match subgraph communities with database communities
  const matchedCommunities = data.apps.map((app) => ({
    ...app,
    metadata: dbCommunities.find((dbComm) => dbComm.id === app.id || dbComm.slug === app.id),
  }));

  return matchedCommunities;
}

export const fetchCommunity = cache(async (slugOrId: string) => {
  const communityFromDb = await getCommunity(slugOrId);

  const chain = await getChainFromCommunityOrCookie(slugOrId);

  if (!communityFromDb) {
    return null;
  }

  const query = `
query ($app: ID!) {
  app(id: $app) {
    id
    name
    owner {
      id
    }
    badges(orderBy: createdAt, orderDirection: desc) {
      id
      name
      metadataURI
      totalAwarded
    }
    tokens {
      id
      token {
        id
        tokenType
        name
        symbol
        createdAt
      }
    }
  }
}
  `;
  try {
    const data = await request<{
      app: {
        id: string;
        name: string;
        owner: { id: string };
        badges: { id: string }[];
        tokens: Token[];
      };
    }>(chain.SUBGRAPH_URL, query, { app: communityFromDb.id });

    const rewards = await fetchAllRewardsByCommunity(communityFromDb.id);

    return {
      ...data.app,
      rewards,
      metadata: communityFromDb,
    };
    // @TODO: Create a generic error handler for subgraph requests
  } catch (error) {
    console.error(error);
    return null;
  }
});

async function fetchAllRewardsByCommunity(communityId: string): Promise<Reward[] | null> {
  const chain = await getChainFromCommunityOrCookie();

  if (!chain) {
    return null;
  }

  // @TODO: Handle pagination
  const query = `
   query ($app: String!) {
  rewards(where: {app: $app}, orderBy: createdAt, orderDirection: desc, first: 10) {
    id
    transactionHash
    metadataURI
    rewardId
    rewardType
    token {
      id
      name
      symbol
    }
    tokenAmount
    badge {
      name
      metadataURI
    }
    badgeTokens {
      tokenId
    }
    user {
      id
    }
    createdAt
  }
}`;

  const data = await request<{
    rewards: Reward[];
  }>(chain.SUBGRAPH_URL, query, { app: communityId });

  return data.rewards;
}

export async function fetchUserProfile(slug: string) {
  const currentUser = await getCurrentUser();
  const community = await getCommunity(slug);
  const chain = await getChainFromCommunityOrCookie();

  if (!currentUser || !community || !chain) {
    return null;
  }

  const query = `
query ($user: ID!, $community: String!) {
  user(id: $user) {
    tokenBalances(where: {token_: {app: $community}}) {
      balance
      token {
        id
        app {
          id
        }
      }
    }
    collectedBadges(where: {badge_: {app: $community}}) {
      badge {
        id
        metadataURI
      }
      tokenId
    }
  }
  rewards(
    where: {user: $user, app: $community}
    orderBy: createdAt
    orderDirection: desc
    first: 10
  ) {
    id
    transactionHash
    metadataURI
    rewardId
    rewardType
    token {
      id
      name
      symbol
    }
    tokenAmount
    badge {
      name
      metadataURI
    }
    badgeTokens {
      tokenId
    }
    createdAt
  }
  badges(where: {app: $community}) {
  id
    name
    metadataURI
  }
}
  `;

  const data = await request<{
    user: UserProfile;
    rewards: Reward[];
    badges: Badge[];
  }>(chain.SUBGRAPH_URL, query, {
    user: currentUser.wallet_address.toLowerCase(),
    community: community.id.toLowerCase(),
  });

  const userCollectedBadges = data.user.collectedBadges.reduce((acc, collected) => {
    acc.set(collected.badge.id, collected.tokenId);
    return acc;
  }, new Map<string, string>());

  const badgesWithCollectedStatus: BadgeWithCollectedStatus[] = data.badges.map((badge) => ({
    ...badge,
    isCollected: userCollectedBadges.has(badge.id),
    tokenId: userCollectedBadges.get(badge.id) || null,
  }));

  return {
    ...data.user,
    rewards: data.rewards,
    badges: badgesWithCollectedStatus,
  };
}

export async function generateLeaderboard(slugOrId: string): Promise<LeaderboardEntry[] | null> {
  const chain = await getChainFromCommunityOrCookie(slugOrId);

  if (!chain) {
    return null;
  }

  try {
    const communityFromDb = await getCommunity(slugOrId);

    if (!communityFromDb || !communityFromDb.token_to_display) {
      return null;
    }

    const params = new URLSearchParams();
    params.set("app_id", communityFromDb.id);
    params.set("token_id", communityFromDb.token_to_display);
    params.set("start", "0");
    params.set("end", "99999999999999999999999999");
    // @TODO: Make this dynamic
    params.set(
      "chain",
      chain.apiChainName === ChainName.AURORA
        ? "aurora"
        : chain.apiChainName === ChainName.TURBO
        ? "turbo"
        : "arbitrum-sepolia"
    );
    const response = await apiClient.get(`/leaderboard?${params}`);

    // Fetch social handles for each user in the leaderboard
    const leaderboardWithHandles = await Promise.all(
      response.data.data.map(async (entry) => ({
        ...entry,
        handle: (await getUserHandle(entry.user as Address))?.username ?? "Anonymous",
        type: (await getUserHandle(entry.user as Address))?.type ?? "unknown",
      }))
    );

    return leaderboardWithHandles;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return { error: "Failed to fetch leaderboard data. Please try again later." };
  }
}

export async function fundAccount() {
  const currentUser = await getCurrentUser();
  console.log({ currentUser });
  // @TODO: Handle multiple chains, check wallet balance, etc.
  if (!config.ACCOUNT_BALANCE_SERVICE_URL || !config.ACCOUNT_BALANCE_SERVICE_AUTH_TOKEN) {
    return null;
  }

  const data = {
    user_address: currentUser?.wallet_address,
    amount: config.ACCOUNT_BALANCE_AMOUNT,
  };

  try {
    const response = await axios.post(`${config.ACCOUNT_BALANCE_SERVICE_URL}`, data, {
      headers: {
        Authorization: `Bearer ${config.ACCOUNT_BALANCE_SERVICE_AUTH_TOKEN}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
