import { agentApiClient } from "@/lib/openformat";
import dayjs from "dayjs";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { platformId, communityId } = await req.json();
  if (!platformId || !communityId) {
    return NextResponse.json({ error: "Missing platformId or communityId" }, { status: 400 });
  }
  //last 14 day with dayjs
  const startDate = dayjs().startOf("day").subtract(14, "day").toISOString();
  const endDate = dayjs().endOf("day").toISOString();

  const payload = {
    platform_id: platformId,
    start_date: startDate,
    end_date: endDate,
  };
  try {
    const response = await agentApiClient.post("/rewards/recommendations", payload, {
      headers: { "X-Community-ID": communityId },
    });
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
