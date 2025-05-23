"use server";

import { agentApiClient } from "@/lib/api";
import { isAxiosError } from "axios";

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
