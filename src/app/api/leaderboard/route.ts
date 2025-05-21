import { getCommunity } from "@/app/actions/communities/get";
import { generateLeaderboard } from "@/lib/openformat";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const communityId = searchParams.get("communityId");
  const tokenId = searchParams.get("tokenId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!communityId) {
    return NextResponse.json({ error: "Missing communityId" }, { status: 400 });
  }

  const community = await getCommunity(communityId);

  if (!community) {
    return NextResponse.json({ error: "Community not found" }, { status: 404 });
  }

  const data = await generateLeaderboard(community, tokenId ?? "", startDate ?? "", endDate ?? "");

  return NextResponse.json(data);
}
