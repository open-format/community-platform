import { NextRequest, NextResponse } from "next/server";
import { agentApiClient } from "@/lib/openformat";

export async function POST(req: NextRequest) {
  const { platformId } = await req.json();
  if (!platformId) {
    return NextResponse.json({ error: "Missing platformId" }, { status: 400 });
  }
  try {
    const response = await agentApiClient.post(`/reports/impact?platformId=${platformId}`);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("[API] start-report-job: Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
