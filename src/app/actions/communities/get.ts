"use server";

import { agentApiClient, throwHTTPErrors } from "@/lib/api";

/**
 * Fetches a community by its identifier
 * @param id - The community identifier. Can be either:
 *   - A UUID representing the community ID
 *   - A platform-specific ID (e.g. Discord guild ID)
 * @returns The community data from the API response
 */
export async function getCommunity(id: string): Promise<Community | null> {
  // Prevent API calls with invalid IDs like "login"
  if (!id || id === "login" || id.length < 3) {
    console.warn(`Invalid community ID provided: "${id}"`);
    return null;
  }

  try {
    const response = await agentApiClient.get(`/communities/${id}`);
    return response.data;
  } catch (error) {
    // Log the full error for debugging
    console.error("Failed to fetch community:", error);
    // Handle HTTP errors
    throwHTTPErrors(`Get Community with ID ${id}`, error);
    // Handle network errors or other non-HTTP errors
    throw new Error("Failed to connect to community service");
  }
}
