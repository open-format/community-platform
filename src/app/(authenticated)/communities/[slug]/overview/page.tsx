import RewardRecommendations from "@/app/(authenticated)/communities/[slug]/overview/components/RewardRecommendations";
import ActivityCard from "@/components/activity-card";
import Leaderboard from "@/components/leaderboard";
import MetricsSection from "@/components/metrics-section";
import RefreshButton from "@/components/refresh-button";
import Shortcuts from "@/components/shortcuts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fetchCommunity, generateLeaderboard, getRewardRecommendations } from "@/lib/openformat";
import { getTranslations } from "next-intl/server";

export default async function Overview({ params }: { params: Promise<{ slug: string }> }) {
  const t = await getTranslations("overview");
  const slug = (await params).slug as `0x${string}`;
  const community = await fetchCommunity(slug);
  const leaderboard = await generateLeaderboard(slug, community?.metadata.token_to_display);
  const rewardRecommendations = await getRewardRecommendations(community?.id ?? "");

  if (!community) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-6 max-w-prose mx-auto text-muted-foreground">
        <h1 className="text-5xl font-bold mb-4 text-foreground">{t("error.title")}</h1>
        <p className="text-muted-foreground mb-4">{t("error.message")}</p>
        <p>{t("error.action")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MetricsSection community={community} />
      <Separator className="my-lg" />
      <div className="grid">
        <Card variant="borderless" className="h-full">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl font-bold tracking-tight">
                {t("rewardRecommendations.title")}
              </CardTitle>
              <RefreshButton />
              {/* <FetchNewRecommendations communityId={community.id} /> */}
            </div>
            <CardDescription>{t("rewardRecommendations.description")}</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <RewardRecommendations
              community={community}
              rewardRecommendations={rewardRecommendations}
            />
          </CardContent>
        </Card>
      </div>
      <Separator className="my-lg" />
      <div className="grid grid-cols-2 gap-4">
        <Card variant="borderless" className="h-full">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl font-bold tracking-tight">
                {t("leaderboard.title")}
              </CardTitle>
              <RefreshButton />
            </div>
            <CardDescription>{t("leaderboard.description")}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Leaderboard
              data={leaderboard || []}
              showSocialHandles={community.metadata.show_social_handles}
              metadata={{
                ...community.metadata,
                user_label: community.metadata.user_label,
                token_label: community.metadata.token_label,
                token_to_display: community.metadata.token_to_display,
              }}
              tokens={community.tokens}
              slug={slug}
            />
          </CardContent>
        </Card>

        <ActivityCard community={community} />
        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-6">Configure your community</h2>
          <Shortcuts community={community} />
        </div>
        <Separator className="my-lg" />
      </div>
    </div>
  );
}
