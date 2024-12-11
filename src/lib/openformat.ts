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
