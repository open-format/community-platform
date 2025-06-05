import { agentApiClient } from "@/lib/openformat";
import { getCurrentUser } from "@/lib/privy";
import { isAxiosError } from "axios";
import { type NextRequest, NextResponse } from "next/server";

function clearTelegramCookies(response: NextResponse) {
  response.cookies.delete("telegramConnected");
  return response;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const platformConnectionId = searchParams.get("platformConnectionId");
  const storedCommunityId = req.cookies.get("communityId")?.value;
  const user = await getCurrentUser();
  const did = user?.id;

  if (!platformConnectionId) {
    const response = NextResponse.redirect(new URL(`${process.env.PLATFORM_BASE_URL}/onboarding/integrations?error=missing_platform_connection_id`, req.url));
    return clearTelegramCookies(response);
  }

  try {
    let communityId = storedCommunityId;
    let setCookieResponse = null;

    if (communityId) {
      try {
        await agentApiClient.get(`/communities/${communityId}`);
      } catch (error) {
        console.warn("Stored community not found, creating new community");
        communityId = undefined;
      }
    }

    if (!communityId) {
      const createRes = await agentApiClient.post("/communities", {
        name: "Community",
      });
      communityId = createRes.data.id;
      if (!communityId || typeof communityId !== "string") {
        const response = NextResponse.redirect(new URL(`${process.env.PLATFORM_BASE_URL}/onboarding/integrations?error=community_creation_failed`, req.url));
        return clearTelegramCookies(response);
      }
      setCookieResponse = NextResponse.redirect(new URL(`${process.env.PLATFORM_BASE_URL}/onboarding/integrations?communityId=${communityId}`, req.url));
      setCookieResponse.cookies.set("communityId", communityId, { 
        path: "/", 
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
      });
    }

    try {
      await agentApiClient.put(`/platform-connections/${platformConnectionId}`, { 
        communityId,
      });
    } catch (error) {
      console.error("Failed to update platform connection:", error);
      const response = NextResponse.redirect(new URL(`${process.env.PLATFORM_BASE_URL}/onboarding/integrations?error=platform_connection_failed`, req.url));
      return clearTelegramCookies(response);
    }

    try {
      await agentApiClient.get(`/users/${did}`);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        await agentApiClient.post("/users", { did });
      }
    }
    
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

    const isDiscordConnected = req.cookies.get("discordConnected")?.value === "true";
    const guildId = req.cookies.get("guildId")?.value;

    const response = NextResponse.redirect(
      new URL(
        isDiscordConnected 
          ? `${process.env.PLATFORM_BASE_URL}/onboarding/setup?guildId=${guildId}&communityId=${communityId}`
          : `${process.env.PLATFORM_BASE_URL}/onboarding/integrations?success=true&communityId=${communityId}`,
        req.url
      )
    );

    const finalResponse = setCookieResponse || response;
    finalResponse.cookies.set("telegramConnected", "true", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    });

    return finalResponse;
  } catch (error) {
    if (isAxiosError(error)) {
      console.error("API Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    } else {
      console.error("Error in Telegram callback:", error);
    }
    const response = NextResponse.redirect(new URL(`${process.env.PLATFORM_BASE_URL}/onboarding/integrations?error=true`, req.url));
    return clearTelegramCookies(response);
  }
}