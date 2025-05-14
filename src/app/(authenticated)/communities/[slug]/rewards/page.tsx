import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import RewardsForm from "@/forms/rewards-form";
import { fetchCommunity, getRewardRecommendations } from "@/lib/openformat";
import { getTranslations } from "next-intl/server";
import RewardRecommendations from "../overview/components/reward-recommendations";

export default async function Rewards({ params }: { params: Promise<{ slug: string }> }) {
  const t = await getTranslations("rewards");
  const slug = (await params).slug;
  const community = await fetchCommunity(slug);
  const rewardRecommendations = await getRewardRecommendations(community?.id ?? "");

  if (!community) {
    return <div>{t("notFound")}</div>;
  }

  return (
    <div>
      <Card variant="borderless">
        <CardHeader>
          <CardTitle>{t("recommendations.title")}</CardTitle>
          <CardDescription>{t("recommendations.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <RewardRecommendations
            community={community}
            rewardRecommendations={rewardRecommendations}
          />
        </CardContent>
      </Card>
      <Separator className="my-lg" />
      <Card variant="borderless">
        <CardHeader>
          <CardTitle>{t("sendReward.title")}</CardTitle>
          <CardDescription>{t("sendReward.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <RewardsForm community={community} />
        </CardContent>
      </Card>
    </div>
  );
}
