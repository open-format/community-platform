// src/app/api/discord/callback/route.ts
import { agentApiClient } from "@/lib/openformat";
import { isAxiosError } from "axios";
import { type NextRequest, NextResponse } from "next/server";

function clearDiscordCookies(response: NextResponse) {
  response.cookies.delete("discordConnected");
  response.cookies.delete("guildId");
  return response;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const encodedState = searchParams.get("state");
  const guildId = searchParams.get("guild_id");
  const storedEncodedState = req.cookies.get("discord_state")?.value;
  const storedCommunityId = req.cookies.get("communityId")?.value;

  if (
    !code ||
    !guildId ||
    !encodedState ||
    !storedEncodedState ||
    encodedState !== storedEncodedState
  ) {
    const response = NextResponse.redirect(
      new URL(
        `${process.env.PLATFORM_BASE_URL}/onboarding/integrations?error=invalid_state`,
        req.url,
      ),
    );
    return clearDiscordCookies(response);
  }

  try {
    const stateObj = JSON.parse(Buffer.from(encodedState, "base64").toString());
    const { did: stateDid } = stateObj;

    if (!stateDid) {
      throw new Error("Missing DID in state");
    }

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
        const response = NextResponse.redirect(
          new URL(
            `${process.env.PLATFORM_BASE_URL}/onboarding/integrations?error=community_creation_failed`,
            req.url,
          ),
        );
        return clearDiscordCookies(response);
      }
      setCookieResponse = NextResponse.redirect(
        new URL(
          `${process.env.PLATFORM_BASE_URL}/onboarding/integrations?communityId=${communityId}`,
          req.url,
        ),
      );
      setCookieResponse.cookies.set("communityId", communityId, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    }

    try {
      await agentApiClient.put(`/platform-connections/${guildId}`, {
        communityId,
      });
    } catch (error) {
      console.error("Failed to update platform connection:", error);
      const response = NextResponse.redirect(
        new URL(
          `${process.env.PLATFORM_BASE_URL}/onboarding/integrations?error=platform_connection_failed`,
          req.url,
        ),
      );
      return clearDiscordCookies(response);
    }

    try {
      await agentApiClient.get(`/users/${stateDid}`);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        await agentApiClient.post("/users", { did: stateDid });
      }
    }

    try {
      await agentApiClient.get(`/users/${stateDid}/roles/${communityId}`);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        await agentApiClient.post("/users/assign-role", {
          did: stateDid,
          community_id: communityId,
          role_name: "Admin",
        });
      }
    }

    const isTelegramConnected = req.cookies.get("telegramConnected")?.value === "true";

    const response = NextResponse.redirect(
      new URL(
        isTelegramConnected
          ? `${process.env.PLATFORM_BASE_URL}/onboarding/setup?guildId=${guildId}&communityId=${communityId}`
          : `${process.env.PLATFORM_BASE_URL}/onboarding/integrations?success=true&guildId=${guildId}&communityId=${communityId}`,
        req.url,
      ),
    );

    const finalResponse = setCookieResponse || response;
    finalResponse.cookies.set("discordConnected", "true", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    finalResponse.cookies.set("guildId", guildId, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
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
      console.error("Error in Discord callback:", error);
    }
    const response = NextResponse.redirect(
      new URL(`${process.env.PLATFORM_BASE_URL}/onboarding/integrations?error=true`, req.url),
    );
    return clearDiscordCookies(response);
  }
}
