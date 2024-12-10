"use server";

import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://api.openformat.tech/v1",
  headers: {
    "x-api-key": process.env.OPENFORMAT_API_KEY,
  },
});

export async function getUserProfile(user: string): Promise<Profile | null> {
  if (!process.env.OPENFORMAT_API_KEY && !process.env.OPENFORMAT_DAPP_ID) {
    return null;
  }

  try {
    const params = new URLSearchParams();
    params.set("chain", "arbitrum-sepolia");
    params.set("user_id", user);

    if (process.env.OPENFORMAT_DAPP_ID) {
      params.set("app_id", process.env.OPENFORMAT_DAPP_ID as string);
    }

    const res = await apiClient.get(`/profile?${params.toString()}`);

    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle Axios specific errors
      console.error("API Error:", error.response?.data || error.message);
    } else {
      // Handle other types of errors
      console.error("Unexpected error:", error instanceof Error ? error.message : String(error));
    }
    return null;
  }
}
