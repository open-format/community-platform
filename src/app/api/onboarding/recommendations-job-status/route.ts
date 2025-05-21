import { NextRequest, NextResponse } from "next/server";
import { agentApiClient } from "@/lib/openformat";

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get("jobId");
  if (!jobId) {
    return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
  }
  try {
    const response = await agentApiClient.get(`/rewards/recommendations/status/${jobId}`);
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
