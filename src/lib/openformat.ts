"use server";

import { chains } from "@/constants/chains";
import { request } from "graphql-request";
import { getCurrentUser } from "./privy";

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
