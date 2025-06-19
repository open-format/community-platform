// src/app/api/telegram/start/route.ts

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { agentApiClient } from "@/lib/api";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const did = searchParams.get("did");
	const communityId = searchParams.get("communityId");

	if (!did) {
		return NextResponse.json({ error: "Missing Privy DID" }, { status: 400 });
	}

	try {
		// Call the backend API to generate a verification code using the authenticated client
		const response = await agentApiClient.post(
			"/communities/telegram/generate-code",
			{
				did,
				community_id: communityId || undefined,
			},
		);

		const { code } = response.data;

		const headersList = await headers();
		const host = headersList.get("host") || "localhost:3000";
		const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

		if (!process.env.TELEGRAM_BOT_USERNAME) {
			console.error("TELEGRAM_BOT_USERNAME environment variable is missing");
			return NextResponse.json(
				{ error: "Missing TELEGRAM_BOT_USERNAME" },
				{ status: 500 },
			);
		}

		// Use the verification code as the state parameter
		const dmLink = `https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?start=${code}`;
		const callbackUrl = `${protocol}://${host}/api/telegram/callback?state=${encodeURIComponent(code)}`;

		return NextResponse.json({
			dmLink,
			callbackUrl,
		});
	} catch (error) {
		console.error("Error in Telegram start:", error);
		return NextResponse.json(
			{
				error: "Failed to initialize Telegram connection",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
