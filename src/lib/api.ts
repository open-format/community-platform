import config from "@/constants/config";
import axios, { isAxiosError } from "axios";

export const agentApiClient = axios.create({
	baseURL: config.COMMUNITY_AGENT_API_URL,
	headers: {
		Authorization: `Bearer ${config.COMMUNITY_AGENT_AUTH_TOKEN}`,
	},
});

export function throwHTTPErrors(action: string, error: unknown) {
	if (isAxiosError(error) && error.response) {
		// Handle specific HTTP error codes
		switch (error.response.status) {
			case 404:
				throw new Error(`API Action ${action} failed. Error: Not found`);
			case 403:
				throw new Error(`API Action ${action} failed. Error: Forbidden, You don't have permission to access this resource`);
			case 401:
				throw new Error(`API Action ${action} failed. Error: Unauthorized access`);
			default:
				throw new Error(
					`API Action ${action} failed. Error: ${error.response.data?.message || "Unknown error"}, Status: ${error.response.status ?? "Undefined"}`
				);
		}
	}
}