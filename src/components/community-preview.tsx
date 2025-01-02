"use client";

import Tiers from "./tiers";

import { cn } from "@/lib/utils";
import { usePrivy } from "@privy-io/react-auth";
import Activity from "./activity";
import CommunityBadges from "./community-badges";
import { CommunityBanner } from "./community-banner";
import CommunityInfo from "./community-info";
import CommunityProfile from "./community-profile";
import Leaderboard from "./leaderboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface CommunityPreviewProps {
  community: Community;
  previewValues: {
    title: string;
    description: string;
    user_label: string;
    token_label: string;
    accent_color: string;
    dark_mode: boolean;
    banner_url: string;
    tiers: {
      name: string;
      points_required: number;
      color: string;
      tier_id?: string;
      community_id?: string;
    }[];
  };
}

export default function CommunityPreview({ community, previewValues }: CommunityPreviewProps) {
  const { user } = usePrivy();

  // TODO: Remove mock data
  const mockLeaderboard: LeaderboardEntry[] = [
    { user: user?.wallet?.address ?? "0x1234567890", xp_rewarded: "1000", positionChange: 1, handle: "@bobdole" },
  ];

  // TODO: Remove mock data
  const mockRewards: Reward[] = [
    {
      id: "1",
      transactionHash: "0x1234567890",
      metadataURI: "https://via.placeholder.com/150",
      rewardId: "bug_fix",
      rewardType: "reward",
      token: { id: "1", name: "Reward 1", symbol: "RWD" },
      tokenAmount: "100",
      badge: { name: "Badge 1", metadataURI: "https://via.placeholder.com/150" },
      badgeTokens: [],
      createdAt: new Date().toISOString(),
    },
  ];

  return (
    <div
      className={cn(
        "max-w-prose mx-auto space-y-4 p-5 rounded-xl bg-background sticky top-0",
        previewValues.dark_mode ? "dark" : "light"
      )}
    >
      {/* Community Profile */}
      <CommunityProfile user={user} />

      {/* Community Banner */}
      <CommunityBanner banner_url={previewValues.banner_url} accent_color={previewValues.accent_color} />

      {/* Community Info */}
      <CommunityInfo title={previewValues.title} description={previewValues.description} />

      {/* Tiers */}
      {previewValues.tiers && previewValues.tiers.length > 0 && (
        <Tiers tiers={previewValues.tiers} currentPoints={25} />
      )}

      <Tabs defaultValue="leaderboard" className="w-full">
        <TabsList>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="leaderboard">
          <Leaderboard
            data={mockLeaderboard}
            metadata={{ user_label: previewValues.user_label, token_label: previewValues.token_label }}
          />
        </TabsContent>
        <TabsContent value="badges">
          <CommunityBadges badges={community?.badges} />
        </TabsContent>
        <TabsContent value="activity">
          <Activity rewards={mockRewards} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
