"use server";

import { type Chain, ChainName, getChain, getChainById } from "@/constants/chains";
import config from "@/constants/config";
import { getCommunities, getCommunity } from "@/db/queries/communities";
import axios from "axios";
import dayjs from "dayjs";
import { request } from "graphql-request";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { cache } from "react";
import type { Address } from "viem";
import { getCurrentUser, getUserHandle } from "./privy";
import { formatTokenAmount } from "./utils";

const apiClient = axios.create({
  baseURL: config.OPENFORMAT_API_URL,
  headers: {
    "x-api-key": config.OPENFORMAT_API_KEY,
  },
});

const agentApiClient = axios.create({
  baseURL: config.COMMUNITY_AGENT_API_URL,
  headers: {
    Authorization: `Bearer ${config.COMMUNITY_AGENT_AUTH_TOKEN}`,
  },
});

const SUBGRAPH_QUERY_PAGES = 20;

export async function revalidate() {
  revalidatePath("/");
}

export async function getChainFromCommunityOrCookie(
  communityIdOrSlug?: string,
  chain_id?: number,
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
    chain = chainName
      ? getChain(chainName.value as ChainName)
      : getChain(ChainName.ARBITRUM_SEPOLIA);
  }

  return chain;
}

export async function fetchAllCommunities() {
  try {
    const chain = await getChainFromCommunityOrCookie();

    if (!chain) {
      console.log("No chain found for chainName:", chain);
      return { data: [], error: "No chain found." };
    }

    const user = await getCurrentUser();
    const dbCommunities = await getCommunities();

    if (!user) {
      return { data: [], error: "User not found." };
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
    try {
      const data = await request<{
        apps: { id: string; name: string; owner: { id: string } }[];
      }>(chain.SUBGRAPH_URL, query, {
        owner: user.wallet_address,
      });

      const matchedCommunities = data.apps.map((app) => ({
        ...app,
        metadata: dbCommunities.find((dbComm) => dbComm.id === app.id || dbComm.slug === app.id),
      }));

      return { data: matchedCommunities || [], error: null };
    } catch {
      return { data: [], error: "Failed to fetch onchain communities. Please try again." };
    }
  } catch {
    return { data: [], error: "Failed to fetch communities. Please try again later." };
  }
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

  const userCollectedBadges = data?.user?.collectedBadges.reduce((acc, collected) => {
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

export async function generateLeaderboard(
  slugOrId: string,
  tokenId?: string,
  startDate: string = "0",
  endDate: string = "99999999999999999999999999",
): Promise<LeaderboardEntry[] | null> {
  const chain = await getChainFromCommunityOrCookie(slugOrId);

  if (!chain) {
    return null;
  }

  try {
    const communityFromDb = await getCommunity(slugOrId);

    if (!communityFromDb) {
      return null;
    }

    const selectedTokenId = tokenId || communityFromDb.token_to_display;

    const params = new URLSearchParams();
    params.set("app_id", communityFromDb.id);
    params.set("token_id", selectedTokenId);
    params.set("start", startDate);
    params.set("end", endDate);
    // @TODO: Make this dynamic
    params.set(
      "chain",
      chain.apiChainName === ChainName.MATCHAIN
        ? "matchain"
        : chain.apiChainName === ChainName.AURORA
          ? "aurora"
          : chain.apiChainName === ChainName.TURBO
            ? "turbo"
            : chain.apiChainName === ChainName.BASE
              ? "base"
              : "arbitrum-sepolia",
    );
    const response = await apiClient.get(`/v1/leaderboard?${params}`);

    // Fetch social handles for each user in the leaderboard
    const leaderboardWithHandles = await Promise.all(
      response.data.data.map(async (entry) => ({
        ...entry,
        handle: (await getUserHandle(entry.user as Address))?.username ?? "Anonymous",
        type: (await getUserHandle(entry.user as Address))?.type ?? "unknown",
      })),
    );

    return leaderboardWithHandles;
  } catch (error) {
    return { error: "Failed to fetch leaderboard data. Please try again later." };
  }
}

export async function fundAccount() {
  const currentUser = await getCurrentUser();
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

export async function generateChallenge(address: string) {
  try {
    const data = { public_address: address };
    const response = await apiClient.post("/key/challenge", data);

    if (response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

export async function verifyChallenge(address: string, signature: string) {
  try {
    const data = { public_address: address, signature: signature };
    const response = await apiClient.post("/key/verify", data);

    if (response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

export async function getAllRewardsByCommunity(
  communityId: string,
  startTimestamp: number,
  endTimestamp: number,
  tokenAddress: string | null,
  rewardType: string | null,
): Promise<string> {
  const chain = await getChainFromCommunityOrCookie();
  if (!chain) {
    throw new Error("Chain not found");
  }
  let last_reward_created_at: string | null = null;
  let paginate = true;
  const options = {
    appId: communityId,
    start: startTimestamp.toString(),
    end: endTimestamp.toString(),
    tokenId: tokenAddress,
  };
  const result: RewardListResponse[] = [];
  while (paginate) {
    const queryList = getRewardQuery(
      chain.subgraph_max_first,
      chain.subgraph_max_skip,
      tokenAddress != null && tokenAddress.length > 0,
      rewardType === "Badge",
      rewardType === "Token",
      last_reward_created_at,
    );

    // Get next page
    const page = await request<RewardListResponse>(chain.SUBGRAPH_URL, queryList, options);
    result.push(page); // Save in result
    // Calculate the total number of elements and update last reward created_at
    let total_rewards = 0;
    for (let i = 0; i < SUBGRAPH_QUERY_PAGES; i++) {
      if (page[`rewards_${i}`]) {
        const len = page[`rewards_${i}`].length;
        total_rewards += len;
        last_reward_created_at =
          len > 0 ? page[`rewards_${i}`].at(len - 1)!.createdAt : last_reward_created_at; // Max reward createdAt in page
      }
    }
    // Check if we should keep paginating:
    //  we retrieved more elements than in max_skip || we retrieved max possible number of elements
    paginate =
      (chain.subgraph_max_skip > 0 && total_rewards >= chain.subgraph_max_skip) || // elems > max_skip
      total_rewards == chain.subgraph_max_first * SUBGRAPH_QUERY_PAGES; // all pages are full
  }

  const rewards: Reward[] = [];

  // Rewards can come duplicated, we use this map to remove duplicated elements
  const rewardIds = new Map<string, boolean>();

  for (const board of result) {
    for (let i: number = SUBGRAPH_QUERY_PAGES - 1; i >= 0; i--) {
      // Save only new rewards and keep record of them
      if (board[`rewards_${i}`]) {
        rewards.push(...board[`rewards_${i}`].filter((b) => !rewardIds.has(b.id)));
        board[`rewards_${i}`].forEach((b) => rewardIds.set(b.id, true));
      }
    }
  }

  const headers = [
    "transactionHash",
    "createdAt",
    "userAddress",
    "tokenAddress",
    "amount",
    "rewardId",
  ];
  const rows = rewards.map(
    (r) =>
      `${r.transactionHash}` +
      `,${dayjs.unix(Number(r.createdAt)).toISOString()}` +
      `,${r.user?.id ?? ""},${r.token?.id ?? r.badge?.id ?? ""}` +
      `,${
        r.tokenAmount === "0"
          ? r.badgeTokens?.length
          : formatTokenAmount(BigInt(r.tokenAmount), r.token?.decimals)
      }` +
      `,${r.rewardId}`,
  );
  return [headers.join(","), ...rows].join("\n");
}

function getRewardQuery(
  max_first: number,
  max_skip: number,
  filterTokenAddress: boolean,
  filterIsBadge: boolean,
  filterIsToken: boolean,
  last_reward_created_at: string | null | undefined = undefined,
): string {
  const pages = SUBGRAPH_QUERY_PAGES;
  let query = `
    query leaderboardTokenData(
      $appId: String!
      $tokenId: String
      $start: String!
      $end: String!
    ) {
  `;
  for (let i = 0; i < pages; i++) {
    const current_skip = i * max_first;
    if (max_skip > 0 && current_skip > max_skip) {
      // We can not ask for more elements in this query
      break;
    }
    query += `
      rewards_${i}: rewards(
        first: ${max_first}
        skip: ${current_skip}
        where: {
          app_contains_nocase: $appId
          createdAt_gte: ${last_reward_created_at ?? "$start"}
          createdAt_lte: $end
          ${filterTokenAddress && filterIsToken ? "token_contains_nocase: $tokenId" : ""}
          ${filterTokenAddress && filterIsBadge ? "badge_contains_nocase: $tokenId" : ""}
          ${filterIsBadge ? "badge_not: null" : ""}
          ${filterIsToken ? "token_not: null" : ""}
        }
        orderBy: createdAt
        orderDirection: asc
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
            decimals
          }
          tokenAmount
          badge {
            id
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
    `;
  }
  query += "}";

  return query;
}

export async function fetchReport(id: string) {
  try {
    const response = await agentApiClient.get(`/reports/impact/${id}`);

    const reportData = response.data.report;

    const transformedData: ImpactReport = {
      endDate: reportData.endDate || Date.now(),
      startDate: reportData.startDate || Date.now() - 30 * 24 * 60 * 60 * 1000,
      summaryId: reportData.summaryId || id,
      timestamp: reportData.timestamp || Date.now(),
      platformId: reportData.platformId || "",
      messageCount: reportData.messageCount || 0,
      uniqueUserCount: reportData.uniqueUserCount || 0,
      overview: {
        totalMessages: reportData?.overview?.totalMessages || reportData.messageCount || 0,
        activeChannels:
          reportData.overview?.activeChannels ||
          (Array.isArray(reportData.channelBreakdown) ? reportData.channelBreakdown.length : 0),
        uniqueUsers: reportData.overview?.uniqueUsers || reportData.uniqueUserCount || 0,
      },
      dailyActivity: Array.isArray(reportData.dailyActivity) ? reportData.dailyActivity : [],
      channelBreakdown: Array.isArray(reportData.channelBreakdown)
        ? reportData.channelBreakdown
        : [],
      topContributors: Array.isArray(reportData.topContributors) ? reportData.topContributors : [],
      keyTopics: Array.isArray(reportData.keyTopics) ? reportData.keyTopics : [],
      userSentiment: reportData.userSentiment || {
        excitement: [],
        frustrations: [],
      },
    };

    return transformedData;
  } catch (error) {
    console.error(error);
    return null;
  }
}
