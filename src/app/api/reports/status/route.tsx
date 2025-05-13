import { agentApiClient } from "@/lib/openformat";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	// get jobId from params
	const jobId = request.nextUrl.searchParams.get("jobId");

	if (!jobId) {
		return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
	}

	const response = await agentApiClient.get(`/reports/impact/status/${jobId}`);

	return NextResponse.json({ status: response.status, data: response.data });
}
