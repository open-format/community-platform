// src/app/api/telegram/start/route.ts

import { headers } from "next/headers";
import { NextResponse } from "next/server";

function encodeStateCompressed(
	did: string,
	communityId: string | null,
): string {
	const didSuffix = did.replace("did:privy:", "");
	const cleanCommunityId = communityId ? communityId.replace(/-/g, "") : null;

	const stateString = cleanCommunityId
		? `${didSuffix}_${cleanCommunityId}`
		: `${didSuffix}_null`;
	return stateString;
}

export function decodeStateCompressed(encoded: string): {
	did: string;
	communityId: string | null;
} {
	const parts = encoded.split("_");

	return {
		did: `did:privy:${parts[0]}`,
		communityId: parts[1] === "null" ? null : parts[1],
	};
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const did = searchParams.get("did");
	const communityId = searchParams.get("communityId");

	if (!did) {
		return NextResponse.json({ error: "Missing Privy DID" }, { status: 400 });
	}

	try {
		const compressedState = encodeStateCompressed(did, communityId || null);

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

		const dmLink = `https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?start=${compressedState}`;
		const callbackUrl = `${protocol}://${host}/api/telegram/callback?state=${encodeURIComponent(compressedState)}`;

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
