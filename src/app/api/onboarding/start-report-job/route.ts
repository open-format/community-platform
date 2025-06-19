import { agentApiClient } from "@/lib/openformat";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { communityId } = await req.json();
  if (!communityId) {
    return NextResponse.json({ error: "Missing communityId" }, { status: 400 });
  }
  try {
    const response = await agentApiClient.post(`/reports/impact?communityId=${communityId}`);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("[API] start-report-job: Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
