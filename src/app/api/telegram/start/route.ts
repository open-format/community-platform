// src/app/api/telegram/start/route.ts

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const did = searchParams.get("did");

  if (!did) {
    return NextResponse.json({ error: "Missing Privy DID" }, { status: 400 });
  }

  try {
    const stateObj = {
      state: randomBytes(16).toString("hex"),
      did,
    };

    const state = Buffer.from(JSON.stringify(stateObj)).toString("base64");
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

    if (!process.env.TELEGRAM_BOT_USERNAME) {
      console.error("TELEGRAM_BOT_USERNAME environment variable is missing");
      return NextResponse.json({ error: "Missing TELEGRAM_BOT_USERNAME" }, { status: 500 });
    }

    const addToGroupUrl = `https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?startgroup=connect_group`;
    const callbackUrl = `${protocol}://${host}/api/telegram/callback?state=${encodeURIComponent(state)}`;

    return NextResponse.json({
      addToGroupUrl,
      callbackUrl,
      state,
    });
  } catch (error) {
    console.error("Error in Telegram start:", error);
    return NextResponse.json({ 
      error: "Failed to initialize Telegram connection",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
