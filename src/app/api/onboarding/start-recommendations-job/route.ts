import { NextRequest, NextResponse } from "next/server";
import { agentApiClient } from "@/lib/openformat";

export async function POST(req: NextRequest) {
  const { platformId, communityId, start_date, end_date } = await req.json();
  if (!platformId || !communityId) {
    return NextResponse.json({ error: "Missing platformId or communityId" }, { status: 400 });
  }
  //if not provided
  const endDate = end_date ? new Date(end_date) : new Date();
  const startDate = start_date ? new Date(start_date) : new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const payload = {
    platform_id: platformId,
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
  };
  try {
    const response = await agentApiClient.post(
      "/rewards/recommendations",
      payload,
      { headers: { "X-Community-ID": communityId } }
    );
    return NextResponse.json(response.data);
  } catch (error: any) {

    if (error.response) {
      console.error("[API] start-recommendations-job: Error response data:", error.response.data);
      return NextResponse.json({ error: error.response.data }, { status: 500 });
    }
    console.error("[API] start-recommendations-job: Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
