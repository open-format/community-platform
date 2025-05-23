import { getCommunity } from "@/app/actions/communities/get";
import MetricsSection from "@/components/metrics-section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import BatchRewardsForm from "@/forms/batch-rewards-form";
import RewardsForm from "@/forms/rewards-form";
import { getTranslations } from "next-intl/server";

export default async function Rewards({ params }: { params: Promise<{ slug: string }> }) {
  const t = await getTranslations("rewards");
  const slug = (await params).slug;
  const community = await getCommunity(slug);

  if (!community) {
    return <div>{t("notFound")}</div>;
  }

  return (
    <div className="space-y-4">
      {community.communityContractAddress && <MetricsSection community={community} />}
      <Card>
        <CardHeader>
          <CardTitle>{t("sendReward.title")}</CardTitle>
          <CardDescription>{t("sendReward.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <RewardsForm community={community} />
        </CardContent>
      </Card>
      <Card>
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
