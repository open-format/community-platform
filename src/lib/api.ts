import config from "@/constants/config";
import axios from "axios";

export const agentApiClient = axios.create({
	baseURL: config.COMMUNITY_AGENT_API_URL,
	headers: {
		Authorization: `Bearer ${config.COMMUNITY_AGENT_AUTH_TOKEN}`,
	},
});
