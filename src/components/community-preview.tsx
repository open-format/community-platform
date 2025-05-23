"use client";

import Tiers from "./tiers";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
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
    userLabel: string;
    tokenLabel: string;
    accentColor: string;
    darkMode: boolean;
    bannerUrl: string;
    showSocialHandles: boolean;
    tokenToDisplay: string;
    tiers: {
      name: string;
      pointsRequired: number;
      color: string;
      tierId?: string;
      communityId?: string;
    }[];
  };
  leaderboard: LeaderboardEntry[];
  badges: BadgeWithCollectedStatus[];
}

export default function CommunityPreview({
  community,
  previewValues,
  leaderboard,
  badges,
}: CommunityPreviewProps) {
  const t = useTranslations("community.preview");

  return (
    <div
      className={cn(
        "max-w-prose mx-auto space-y-4 p-5 rounded-xl bg-background sticky top-0",
        previewValues.darkMode ? "dark" : "light",
      )}
    >
      {/* Community Profile */}
      <CommunityProfile />

      {/* Community Banner */}
      <CommunityBanner
        bannerUrl={previewValues.bannerUrl}
        accentColor={previewValues.accentColor}
      />

      {/* Community Info */}
      <CommunityInfo title={previewValues.title} description={previewValues.description} />

      {/* Tiers */}
      {previewValues.tiers && previewValues.tiers.length > 0 && (
        <Tiers
          tiers={previewValues.tiers}
          currentPoints={25}
          tokenLabel={previewValues.tokenLabel}
        />
      )}

      <Tabs defaultValue="leaderboard" className="w-full">
        <TabsList>
          <TabsTrigger value="leaderboard">{t("tabs.leaderboard")}</TabsTrigger>
          <TabsTrigger value="badges">{t("tabs.badges")}</TabsTrigger>
          <TabsTrigger value="activity">{t("tabs.activity")}</TabsTrigger>
        </TabsList>
        <TabsContent value="leaderboard">
          <Leaderboard
            data={leaderboard}
            community={community}
            showSocialHandles={Boolean(previewValues?.showSocialHandles)}
            tokens={community.onchainData?.tokens}
            slug={community.slug}
          />
        </TabsContent>
        <TabsContent value="badges">
          <CommunityBadges badges={badges} />
        </TabsContent>
        <TabsContent value="activity">
          <Activity rewards={community?.rewards || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
