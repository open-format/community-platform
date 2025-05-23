import { getCommunity } from "@/app/actions/communities/get";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import BatchRewardsForm from "@/forms/batch-rewards-form";
import RewardsForm from "@/forms/rewards-form";
import { getTranslations } from "next-intl/server";
import RewardRecommendations from "../overview/components/reward-recommendations";

export default async function Rewards({ params }: { params: Promise<{ slug: string }> }) {
  const t = await getTranslations("rewards");
  const slug = (await params).slug;
  const community = await getCommunity(slug);

  if (!community) {
    return <div>{t("notFound")}</div>;
  }

  return (
    <div>
      <Card variant="borderless">
        <CardHeader>
          <CardTitle>{t("rewardRecommendations.title")}</CardTitle>
          <CardDescription>{t("rewardRecommendations.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <RewardRecommendations community={community} />
        </CardContent>
      </Card>
      <Card variant="borderless">
        <CardHeader>
          <CardTitle>{t("sendReward.title")}</CardTitle>
          <CardDescription>{t("sendReward.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <RewardsForm community={community} />
        </CardContent>
      </Card>
      <Card variant="borderless">
        <CardHeader>
          <CardTitle>{t("sendReward.title")}</CardTitle>
          <CardDescription>{t("sendReward.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <BatchRewardsForm community={community} />
        </CardContent>
      </Card>
    </div>
  );
}
