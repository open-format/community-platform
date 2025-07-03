import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { agentApiClient } from "@/lib/api";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		const {
			rewardId,
			communityId,
			contributorName,
			platform,
			points,
			summary,
			description,
			transactionHash,
		} = body;

		// Call the agent API to send the notification
		const response = await agentApiClient.post("/notifications/send-reward", {
			rewardId,
			communityId,
			contributorName,
			platform,
			points,
			summary,
			description,
			transactionHash,
		});

		return NextResponse.json({ success: true, data: response.data });
	} catch (error) {
		console.error("❌ Failed to send reward notification:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to send notification" },
			{ status: 500 },
		);
	}
}
