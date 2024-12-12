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
  const data = await request<{ apps: { id: string; name: string; owner: { id: string } }[] }>(
    chains.arbitrumSepolia.SUBGRAPH_URL,
    query,
    { owner: user.wallet_address }
  );
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
    }
  }
  fungibleTokens(where: {app_: {id: $app}}) {
    name
    symbol
    id
    totalSupply
  }
}
  `;
  try {
    const data = await request<{
      app: { id: string; name: string; owner: { id: string }; badges: { id: string }[] };
      fungibleTokens: { name: string; symbol: string; id: string; totalSupply: string }[];
    }>(chains.arbitrumSepolia.SUBGRAPH_URL, query, { app: communityId });

    return {
      ...data.app,
      tokens: data.fungibleTokens,
    };
    // @TODO: Create a generic error handler for subgraph requests
  } catch (error) {
    console.error(error);
    return null;
  }
}
