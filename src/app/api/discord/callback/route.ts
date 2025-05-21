// src/app/api/discord/callback/route.ts
import { agentApiClient } from "@/lib/openformat";
import { isAxiosError } from "axios";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const encodedState = searchParams.get("state");
  const guildId = searchParams.get("guild_id");
  const storedEncodedState = req.cookies.get("discord_state")?.value;

  if (
    !code ||
    !guildId ||
    !encodedState ||
    !storedEncodedState ||
    encodedState !== storedEncodedState
  ) {
    return NextResponse.redirect(new URL("/onboarding/integrations?error=true", req.url));
  }

  try {
    // Decode the state to get both the random state and DID
    const stateObj = JSON.parse(Buffer.from(encodedState, "base64").toString());
    const { did } = stateObj;

    if (!did) {
      throw new Error("Missing DID in state");
    }

    // Call agent api to get community id
    const communityRes = await agentApiClient.get(`/communities/${guildId}`);
    const communityId = communityRes.data.id;

    // Call agent api to create user
    await agentApiClient.post("/users", {
      did,
    });

    // Call agent api to assign role
    await agentApiClient.post("/users/assign-role", {
      did: did,
      community_id: communityId,
      role_name: "Admin",
    });

    // Redirect to integrations page with all necessary params
    const redirectUrl = new URL("/onboarding/integrations", req.url);
    redirectUrl.searchParams.set("guildId", guildId);
    redirectUrl.searchParams.set("communityId", communityId);

    return NextResponse.redirect(redirectUrl);
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
    return NextResponse.redirect(new URL("/onboarding/integrations?error=true", req.url));
  }
}
