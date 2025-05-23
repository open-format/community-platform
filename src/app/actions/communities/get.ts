"use server";

import { agentApiClient } from "@/lib/api";
import { isAxiosError } from "axios";

/**
 * Fetches a community by its identifier
 * @param id - The community identifier. Can be either:
 *   - A UUID representing the community ID
 *   - A platform-specific ID (e.g. Discord guild ID)
 * @returns The community data from the API response
 */
export async function getCommunity(id: string): Promise<Community> {
  try {
    const response = await agentApiClient.get(`/communities/${id}`);
    return response.data;
  } catch (error) {
    // Log the full error for debugging
    console.error("Failed to fetch community:", error);

    // Check if it's an Axios error with a response
    if (isAxiosError(error) && error.response) {
      // Handle specific HTTP error codes
      switch (error.response.status) {
        case 404:
          throw new Error(`Community with ID ${id} not found`);
        case 403:
          throw new Error("You don't have permission to access this community");
        case 401:
          throw new Error("Unauthorized access to community");
        default:
          throw new Error(
            `Failed to fetch community: ${error.response.data.message || "Unknown error"}`,
          );
      }
    }

    // Handle network errors or other non-HTTP errors
    throw new Error("Failed to connect to community service");
  }
}
