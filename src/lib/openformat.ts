"use server";

import { chains } from "@/constants/chains";
import { getCommunities, getCommunity } from "@/db/queries/communities";
import axios from "axios";
import { request } from "graphql-request";
import { revalidatePath } from "next/cache";
import { cache } from "react";
import { getCurrentUser } from "./privy";

const apiClient = axios.create({
  baseURL: process.env.OPENFORMAT_API_URL,
  headers: {
    "x-api-key": process.env.OPENFORMAT_API_KEY,
  },
});

export async function revalidate() {
  revalidatePath("/");
}
export async function fetchAllCommunities() {
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
  }>(chains.arbitrumSepolia.SUBGRAPH_URL, query, {
    owner: user.wallet_address,
  });

  // Match subgraph communities with database communities
  const matchedCommunities = data.apps.map((app) => ({
    ...app,
    metadata: dbCommunities.find((dbComm) => dbComm.id === app.id || dbComm.slug === app.id),
  }));

  return matchedCommunities;
}

export const fetchCommunity = cache(async (slug: string) => {
  const query = `
query ($app: ID!) {
  app(id: $app) {
    id
    name
    owner {
      id
    }
    badges {
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
    }>(chains.arbitrumSepolia.SUBGRAPH_URL, query, { app: slug });

    const missions = await fetchAllMissionsByCommunity(slug);

    const metadata = await getCommunity(slug);

    return {
      ...data.app,
      missions,
      metadata,
    };
    // @TODO: Create a generic error handler for subgraph requests
  } catch (error) {
    console.error(error);
    return null;
  }
});

async function fetchAllMissionsByCommunity(communityId: string): Promise<Mission[]> {
  // @TODO: Handle pagination
  const query = `
    query ($app: String!) {
      missions(where: {app: $app}, orderBy: createdAt, orderDirection: desc) {
        metadata {
          name
        }
        user {
          id
        }
        tokens {
          amount_rewarded
          token {
            name
          }
        }
        createdAt
      }
    }
  `;

  const data = await request<{
    missions: {
      metadata: { name: string };
      user: { id: string };
      tokens: { amount_rewarded: string; token: { name: string } }[];
      createdAt: string;
    }[];
  }>(chains.arbitrumSepolia.SUBGRAPH_URL, query, { app: communityId });

  return data.missions;
}

export async function fetchUserProfile(slug: string) {
  const currentUser = await getCurrentUser();
  const community = await getCommunity(slug);

  if (!currentUser || !community) {
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
  }>(chains.arbitrumSepolia.SUBGRAPH_URL, query, {
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

export async function generateLeaderboard(slug: string, token: string) {
  try {
    const community = await getCommunity(slug);

    if (!community) {
      return null;
    }

    const params = new URLSearchParams();
    params.set("app_id", community.id);
    params.set("token", token);
    params.set("start", "0");
    params.set("end", "99999999999999999999999999");
    // @TODO: Make this dynamic
    params.set("chain", "arbitrum-sepolia");

    const response = await apiClient.get(`/leaderboard?${params}`);

    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
