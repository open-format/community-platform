import { agentApiClient } from "@/lib/openformat";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get("jobId");
  if (!jobId) {
    return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
  }
  try {
    const response = await agentApiClient.get(`/summaries/historical-messages/status/${jobId}`);
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
