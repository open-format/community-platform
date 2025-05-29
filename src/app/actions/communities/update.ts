"use server";

import { agentApiClient } from "@/lib/api";
import { isAxiosError } from "axios";
import { revalidatePath } from "next/cache";
import type { Address } from "viem";

type UpdateCommunityData = {
  communityContractAddress?: Address;
  communityContractChainId?: number;
  hiddenTokens?: Address[];
};

export async function updateCommunity(id: string, data: UpdateCommunityData) {
  try {
    const response = await agentApiClient.put(`/communities/${id}`, data);

    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data.message);
    }
    throw error;
  }
}

export async function updateTokenVisibility(
  community: Community,
  tokenId: string,
  hidden: boolean,
) {
  try {
    // Ensure current hidden tokens is an array and remove duplicates
    const currentHiddenTokens = [...new Set(community.hiddenTokens || [])];

    const newHiddenTokens = hidden
      ? [...new Set([...currentHiddenTokens, tokenId])] // Add token and remove duplicates
      : currentHiddenTokens.filter((id) => id !== tokenId);

    await updateCommunity(community.id, {
      hiddenTokens: newHiddenTokens as Address[],
    });

    // Force a hard revalidate
    revalidatePath(`/communities/${community.slug}/tokens`, "page");

    return { success: true };
  } catch (error) {
    console.error("Error updating token visibility:", error);
    return { success: false, error };
  }
}
