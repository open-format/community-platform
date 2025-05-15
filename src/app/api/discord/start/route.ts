// src/app/api/discord/start/route.ts

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";

export async function GET() {
  const state = randomBytes(16).toString("hex");
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  if (!process.env.DISCORD_CLIENT_ID) {
    return NextResponse.json({ error: "Missing DISCORD_CLIENT_ID" }, { status: 500 });
  }

  const redirectUri = `${protocol}://${host}/api/discord/callback`;

  const redirectUrl = new URL("https://discord.com/oauth2/authorize");
  redirectUrl.searchParams.set("client_id", process.env.DISCORD_CLIENT_ID);
  redirectUrl.searchParams.set("permissions", "66560");
  redirectUrl.searchParams.set("scope", "bot");
  redirectUrl.searchParams.set("response_type", "code");
  redirectUrl.searchParams.set("redirect_uri", redirectUri);
  redirectUrl.searchParams.set("state", state);

  const res = NextResponse.redirect(redirectUrl.toString());

  res.cookies.set("discord_state", state, {
    httpOnly: true,
    maxAge: 300,
    path: "/",
  });

  return res;
}