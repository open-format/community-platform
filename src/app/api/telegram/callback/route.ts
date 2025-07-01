import { agentApiClient } from "@/lib/openformat";
import { getCurrentUser } from "@/lib/privy";
import { isAxiosError } from "axios";
import { type NextRequest, NextResponse } from "next/server";

interface PlatformConnection {
  id: string;
  communityId?: string;
  platformId: string;
  platformType: string;
}

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

async function getOrCreateCommunity(
  communityId: string | undefined,
  existingPlatformConnection: PlatformConnection | null = null,
) {
  if (existingPlatformConnection?.communityId) {
    const community = await agentApiClient
      .get(`/communities/${existingPlatformConnection.communityId}`)
      .then((res) => res.data);
    return {
      community,
      communityId: existingPlatformConnection.communityId,
      isNewCommunity: false,
    };
  }

  if (communityId) {
    try {
      const community = await agentApiClient
        .get(`/communities/${communityId}`)
        .then((res) => res.data);
      return { community, communityId, isNewCommunity: false };
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

  return { community, communityId: community.id, isNewCommunity: true };
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
  const stateParam = searchParams.get("state");
  const storedCommunityId = req.cookies.get("communityId")?.value;
  const user = await getCurrentUser();
  const did = user?.id;

  if (stateParam) {
    try {
      const verificationCode = stateParam;
      const verificationResponse = await agentApiClient.get(
        `/communities/telegram/verify/${verificationCode}`,
      );

      const verificationData = verificationResponse.data;
      const { did: stateDid, communityId: stateCommunityId } = verificationData;

      if (!stateDid) {
        console.error("[Telegram] Missing DID in verification data:", verificationData);
        return createErrorRedirect("invalid_state", req);
      }

      const { community, communityId, isNewCommunity } = await getOrCreateCommunity(
        stateCommunityId || undefined,
        null,
      );

      // Find the platform connection by platformId
      let existingPlatformConnection: PlatformConnection | null = null;
      if (platformConnectionId) {
        try {
          const platformConnection = await agentApiClient.get(
            `/platform-connections/${platformConnectionId}`,
          );
          const platformId = platformConnection.data.platformId;

          const platformResponse = await agentApiClient.get(
            `/platform-connections/by-platform-id/telegram/${platformId}`,
          );
          existingPlatformConnection = platformResponse.data;
        } catch (error) {
          if (isAxiosError(error) && error.response?.status === 404) {
          } else {
            console.error("Error checking for existing platform connection:", error);
          }
        }
      }

      // Update platform connection
      try {
        if (existingPlatformConnection) {
          await agentApiClient.put(`/platform-connections/${existingPlatformConnection.id}`, {
            communityId,
          });
        } else if (platformConnectionId) {
          await agentApiClient.put(`/platform-connections/${platformConnectionId}`, {
            communityId,
          });
        }
      } catch (error) {
        console.error("Failed to update platform connection:", error);
        return createErrorRedirect("platform_connection_failed", req);
      }

      await setupUserAndRole(stateDid, communityId);

      // Mark the verification code as used after successful processing
      try {
        await agentApiClient.post(`/communities/telegram/mark-used/${verificationCode}`);
      } catch (error) {
        console.error("Failed to mark verification code as used:", error);
      }

      const redirectUrl = `${process.env.PLATFORM_BASE_URL}/onboarding/integrations?success=true&platformId=${existingPlatformConnection?.platformId || platformConnectionId}&communityId=${communityId}&isNew=${isNewCommunity}&firstConnection=${!existingPlatformConnection?.communityId}`;

      const nextResponse = NextResponse.redirect(new URL(redirectUrl, req.url));

      // Set community cookie
      nextResponse.cookies.set("communityId", communityId, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
      });

      return nextResponse;
    } catch (error) {
      console.error("Error processing verification code:", error);
      return createErrorRedirect("invalid_state", req);
    }
  }

  // Handle existing platformConnectionId flow
  if (!platformConnectionId) {
    return createErrorRedirect("missing_platform_connection_id", req);
  }

  if (!did) {
    return createErrorRedirect("user_not_authenticated", req);
  }

  try {
    let existingPlatformConnection: PlatformConnection | null = null;
    try {
      const platformConnection = await agentApiClient.get(
        `/platform-connections/${platformConnectionId}`,
      );
      const platformId = platformConnection.data.platformId;

      const platformResponse = await agentApiClient.get(
        `/platform-connections/by-platform-id/telegram/${platformId}`,
      );
      existingPlatformConnection = platformResponse.data;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
      } else {
        console.error("Error checking for existing platform connection:", {
          platformConnectionId,
          error: error instanceof Error ? error.message : String(error),
          status: isAxiosError(error) ? error.response?.status : "unknown",
        });
      }
    }

    // Get or create community
    const { community, communityId, isNewCommunity } = await getOrCreateCommunity(
      storedCommunityId,
      existingPlatformConnection,
    );

    // Update platform connection
    try {
      if (existingPlatformConnection) {
        await agentApiClient.put(`/platform-connections/${existingPlatformConnection.id}`, {
          communityId,
        });
      } else {
        await agentApiClient.put(`/platform-connections/${platformConnectionId}`, { communityId });
      }
    } catch (error) {
      console.error("Failed to update platform connection:", error);
      return createErrorRedirect("platform_connection_failed", req);
    }

    await setupUserAndRole(did, communityId);

    // Get final community state
    const finalCommunity = await agentApiClient
      .get(`/communities/${communityId}`)
      .then((res) => res.data)
      .catch((error) => {
        console.error("Failed to get community:", error);
        return community;
      });

    const redirectUrl = `${process.env.PLATFORM_BASE_URL}/onboarding/integrations?success=true&platformId=${existingPlatformConnection?.platformId || platformConnectionId}&communityId=${communityId}&isNew=${isNewCommunity}&firstConnection=${!existingPlatformConnection?.communityId}`;

    const response = NextResponse.redirect(new URL(redirectUrl, req.url));

    // Set community cookie
    response.cookies.set("communityId", communityId, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
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
    return createErrorRedirect("callback_error", req);
  }
}
