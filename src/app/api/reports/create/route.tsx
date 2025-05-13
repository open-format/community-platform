import { agentApiClient } from "@/lib/openformat";
import dayjs from "dayjs";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	// get platformId from request
	try {
		const platformId = request.nextUrl.searchParams.get("platformId");
		const startDate = dayjs().subtract(1, "week").toISOString();
		const endDate = dayjs().toISOString();

		if (!platformId) {
			return NextResponse.json(
				{ error: "Platform ID is required" },
				{ status: 400 },
			);
		}

		const response = await agentApiClient.post("/reports/impact", null, {
			params: {
				platformId,
				startDate,
				endDate,
			},
		});

		return NextResponse.json({ status: response.status, data: response.data });
	} catch (error) {
		return NextResponse.json(
			{ error: (error as Error).message },
			{ status: 500 },
		);
	}
}
