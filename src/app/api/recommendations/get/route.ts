import { agentApiClient } from "@/lib/api";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const communityId = searchParams.get("communityId");
    const platformId = searchParams.get("platformId");

    if (!communityId && !platformId) {
      return NextResponse.json(
        { error: "Community ID or platform ID is required" },
        { status: 400 },
      );
    }

    const response = await agentApiClient.get("/rewards/recommendations", {
      headers: {
        "X-Community-ID": communityId ?? "",
      },
      params: {
        platform_id: platformId,
      },
    });

    return NextResponse.json({
      status: response.status,
      data: response.data,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
