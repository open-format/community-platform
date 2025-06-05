import { agentApiClient } from "@/lib/openformat";
import { getCurrentUser } from "@/lib/privy";
import { isAxiosError } from "axios";
import { type NextRequest, NextResponse } from "next/server";

function clearTelegramCookies(response: NextResponse) {
  response.cookies.delete("telegramConnected");
  return response;
}

function createErrorRedirect(error: string, req: NextRequest) {
  return clearTelegramCookies(
    NextResponse.redirect(
      new URL(`${process.env.PLATFORM_BASE_URL}/onboarding/integrations?error=${error}`, req.url),
    ),
  );
}

async function getOrCreateCommunity(communityId: string | undefined) {
  if (communityId) {
    try {
      const community = await agentApiClient
        .get(`/communities/${communityId}`)
        .then((res) => res.data);
      return { community, communityId };
    } catch (error) {
      console.warn("Stored community not found, creating new community");
    }
  }

  const community = await agentApiClient
    .post("/communities", { name: "Community" })
    .then((res) => res.data);

  if (!community.id || typeof community.id !== "string") {
    throw new Error("Community creation failed");
  }

  return { community, communityId: community.id };
}

async function setupUserAndRole(did: string, communityId: string) {
  // Create user if doesn't exist
  try {
    await agentApiClient.get(`/users/${did}`);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      await agentApiClient.post("/users", { did });
    }
  }

  // Assign admin role if doesn't exist
  try {
    await agentApiClient.get(`/users/${did}/roles/${communityId}`);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      await agentApiClient.post("/users/assign-role", {
        did,
        community_id: communityId,
        role_name: "Admin",
      });
    }
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const platformConnectionId = searchParams.get("platformConnectionId");
  const storedCommunityId = req.cookies.get("communityId")?.value;
  const user = await getCurrentUser();
  const did = user?.id;

  if (!platformConnectionId) {
    return createErrorRedirect("missing_platform_connection_id", req);
  }

  if (!did) {
    return createErrorRedirect("user_not_authenticated", req);
  }

  try {
    // Get or create community
    const { community, communityId } = await getOrCreateCommunity(storedCommunityId);

    // Update platform connection
    try {
      await agentApiClient.put(`/platform-connections/${platformConnectionId}`, { communityId });
    } catch (error) {
      console.error("Failed to update platform connection:", error);
      return createErrorRedirect("platform_connection_failed", req);
    }

    // Setup user and role
    await setupUserAndRole(did, communityId);

    // Get final community state
    const finalCommunity = await agentApiClient
      .get(`/communities/${communityId}`)
      .then((res) => res.data)
      .catch((error) => {
        console.error("Failed to get community:", error);
        return community;
      });

    // Determine redirect URL based on Discord connection
    const isDiscordConnected = finalCommunity?.platformConnections?.some(
      (platform) => platform.platformType === "discord",
    );
    const guildId = req.cookies.get("guildId")?.value;

    const redirectUrl = isDiscordConnected
      ? `${process.env.PLATFORM_BASE_URL}/onboarding/setup?guildId=${guildId}&communityId=${communityId}`
      : `${process.env.PLATFORM_BASE_URL}/onboarding/integrations?success=true&communityId=${communityId}`;

    const response = NextResponse.redirect(new URL(redirectUrl, req.url));

    // Set community cookie
    response.cookies.set("communityId", communityId, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    if (isAxiosError(error)) {
      console.error("API Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        endpoint: error.config?.url,
      });
    } else {
      console.error("Error in Telegram callback:", error);
    }
    return createErrorRedirect("true", req);
  }
}
