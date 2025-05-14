import { agentApiClient } from "@/lib/api";
import { isAxiosError } from "axios";

type CommunitiesResponse = {
  communities: Community[];
  error: string | null;
};

export default async function getCommunities(): Promise<CommunitiesResponse> {
  try {
    const response = await agentApiClient.get("/communities?limit=100");
    return {
      communities: response.data.data,
      error: null,
    };
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      switch (error.response.status) {
        case 401:
          return {
            communities: [],
            error: "Unauthorized access to communities",
          };
        default:
          return {
            communities: [],
            error: "Failed to fetch communities",
          };
      }
    }
    // Handle unexpected errors
    return {
      communities: [],
      error: "An unexpected error occurred",
    };
  }
}
