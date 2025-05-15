// src/app/api/discord/callback/route.ts
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const guildId = searchParams.get("guild_id");
  const storedState = req.cookies.get("discord_state")?.value;

  if (!code || !guildId || state !== storedState) {
    return NextResponse.redirect(new URL("/onboarding/integrations?error=true", req.url));
  }

  console.log("YAY!", guildId);

  const res = NextResponse.redirect(
    new URL(`/onboarding/integrations?guildId=${guildId}`, req.url)
  );
  res.cookies.set("discord_state", "", { maxAge: 0, path: "/" }); // clear cookie
  return res;
}
