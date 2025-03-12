"use server";

import config from "@/constants/config";
import { PrivyClient } from "@privy-io/server-auth";
import { cookies } from "next/headers";
import type { Address } from "viem";
import pMap from 'p-map';

if (!config.NEXT_PUBLIC_PRIVY_APP_ID || !config.PRIVY_APP_SECRET) {
  throw new Error("Privy app ID or secret is not set");
}

// @TODO: What is the current rate limit for API calls?
// Each call to find user triggers 2 API calls, one for each Social Login.
const PRIVY_FIND_USER_CONCURRENCY_LIMIT = 10; // 20 concurrent connections to Privy API

const privyClient = new PrivyClient(config.NEXT_PUBLIC_PRIVY_APP_ID, config.PRIVY_APP_SECRET);

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("privy-id-token")?.value;

  if (!authToken) {
    return null;
  }

  const user = await privyClient.getUser({ idToken: authToken });
  const walletAddress = user.linkedAccounts.find((account) => account.type === "wallet")?.address;

  if (!walletAddress) {
    return null;
  }

  //@TODO: get apps from subgraph
  const apps = ["0x123"];

  return { id: user.id, wallet_address: walletAddress, apps };
}

export async function findAllUsersByHandle(handles: string[]) {
  return pMap(handles, findAllSocialsByHandle, {
    concurrency: PRIVY_FIND_USER_CONCURRENCY_LIMIT,
    stopOnError: true,
  });

}

async function findAllSocialsByHandle(handle: string) {
  if (!handle) {
    return {
      handle,
      discordWalletAddress: null,
      githubWalletAddress: null,
    };
  }
  const [discordUser, githubUser] = await Promise.all([
    privyClient.getUserByDiscordUsername(handle),
    privyClient.getUserByGithubUsername(handle),
  ]);

  return {
    handle,
    discordWalletAddress: discordUser?.wallet?.address ?? null,
    githubWalletAddress: githubUser?.wallet?.address ?? null,
  };
}

export async function findUserByHandle(handle: string): Promise<{
  type: "discord" | "github";
  username: string | null;
  wallet: string | null;
} | null> {
  if (!handle || typeof handle !== "string") {
    return null;
  }

  try {
    const [discordUser, githubUser] = await Promise.all([
      privyClient.getUserByDiscordUsername(handle).catch(() => null),
      privyClient.getUserByGithubUsername(handle).catch(() => null),
    ]);

    // Return the first non-null user found
    if (discordUser) {
      return {
        type: "discord",
        username: discordUser.discord?.username ?? null,
        wallet: discordUser.wallet?.address ?? null,
      };
    }

    if (githubUser) {
      return {
        type: "github",
        username: githubUser.github?.username ?? null,
        wallet: githubUser.wallet?.address ?? null,
      };
    }

    return null;
  } catch (error) {
    console.error("Error searching for user:", {
      handle,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export async function getUserHandle(wallet: Address): Promise<{
  type: "discord" | "telegram" | "github";
  username: string | null;
} | null> {
  const user = await privyClient.getUserByWalletAddress(wallet);

  if (user?.github?.username) {
    return { type: "github", username: user.github.username };
  }

  if (user?.discord?.username) {
    return { type: "discord", username: user.discord.username };
  }
  if (user?.telegram?.username) {
    return { type: "telegram", username: user.telegram.username };
  }

  return null;
}
