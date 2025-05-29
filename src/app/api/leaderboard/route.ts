import { getCommunity } from "@/app/actions/communities/get";
import { ChainName, getChainById } from "@/constants/chains";
import { apiClient } from "@/lib/openformat";
import { getUserHandle } from "@/lib/privy";
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

  const selectedTokenId = tokenId || community.tokenToDisplay || "";

  const chain = getChainById(community.communityContractChainId);

  if (!chain) {
    return NextResponse.json({ error: "Chain not found" }, { status: 404 });
  }

  const params = new URLSearchParams();
  params.set("app_id", community.communityContractAddress);
  params.set("token_id", selectedTokenId);
  params.set("start", startDate ?? "");
  params.set("end", endDate ?? "");
  params.set(
    "chain",
    chain.apiChainName === ChainName.MATCHAIN
      ? "matchain"
      : chain.apiChainName === ChainName.AURORA
        ? "aurora"
        : chain.apiChainName === ChainName.TURBO
          ? "turbo"
          : chain.apiChainName === ChainName.BASE
            ? "base"
            : "arbitrum-sepolia",
  );

  const response = await apiClient.get(`/v1/leaderboard?${params}`);

  // Fetch social handles for each user in the leaderboard
  const leaderboardWithHandles = await Promise.all(
    response.data.data.map(async (entry: LeaderboardEntry) => ({
      ...entry,
      handle: (await getUserHandle(entry.user))?.username ?? "Anonymous",
      type: (await getUserHandle(entry.user))?.type ?? "unknown",
    })),
  );

  return NextResponse.json(leaderboardWithHandles);
}
