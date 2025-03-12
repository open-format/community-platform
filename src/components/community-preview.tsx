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
    user_label: string;
    token_label: string;
    accent_color: string;
    dark_mode: boolean;
    banner_url: string;
    show_social_handles: boolean;
    token_to_display: string;
    tiers: {
      name: string;
      points_required: number;
      color: string;
      tier_id?: string;
      community_id?: string;
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
        previewValues.dark_mode ? "dark" : "light",
      )}
    >
      {/* Community Profile */}
      <CommunityProfile />

      {/* Community Banner */}
      <CommunityBanner
        banner_url={previewValues.banner_url}
        accent_color={previewValues.accent_color}
      />

      {/* Community Info */}
      <CommunityInfo title={previewValues.title} description={previewValues.description} />

      {/* Tiers */}
      {previewValues.tiers && previewValues.tiers.length > 0 && (
        <Tiers
          tiers={previewValues.tiers}
          currentPoints={25}
          tokenLabel={previewValues.token_label}
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
            metadata={{
              ...community.metadata,
              user_label: previewValues.user_label,
              token_label: previewValues.token_label,
              token_to_display: previewValues.token_to_display,
            }}
            showSocialHandles={Boolean(previewValues?.show_social_handles)}
            tokens={community.tokens}
            slug={community.metadata.slug}
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
