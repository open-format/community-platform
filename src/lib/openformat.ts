"use server";

import { chains } from "@/constants/chains";
import axios from "axios";
import { request } from "graphql-request";
import { getCurrentUser } from "./privy";

const apiClient = axios.create({
  baseURL: process.env.OPENFORMAT_API_URL,
  headers: {
    "x-api-key": process.env.OPENFORMAT_API_KEY,
  },
});

export async function fetchAllCommunities() {
  const user = await getCurrentUser();

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
  return data.apps;
}

export async function fetchCommunity(communityId: string): Promise<Community | null> {
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
        name
        symbol
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
    }>(chains.arbitrumSepolia.SUBGRAPH_URL, query, { app: communityId });

    const missions = await fetchAllMissionsByCommunity(communityId);

    return {
      ...data.app,
      missions,
    };
    // @TODO: Create a generic error handler for subgraph requests
  } catch (error) {
    console.error(error);
    return null;
  }
}

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

export async function fetchUserProfile(communityId: string) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return null;
  }

  const query = `
query ($user: ID!, $community: String!) {
  user(id: $user) {
    tokenBalances(where: {token_: {app: $community}}) {
      balance
      token {
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
}
  `;

  const data = await request<{
    user: UserProfile;
    rewards: Reward[];
  }>(chains.arbitrumSepolia.SUBGRAPH_URL, query, {
    user: currentUser.wallet_address.toLowerCase(),
    community: communityId,
  });

  return { ...data.user, rewards: data.rewards };
}

export async function generateLeaderboard(communityId: string, token: string) {
  try {
    const params = new URLSearchParams();
    params.set("app_id", communityId);
    params.set("token", token);
    // @TODO: Make this dynamic
    params.set("chain", "arbitrum-sepolia");

    const response = await apiClient.get(`/leaderboard?${params}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
