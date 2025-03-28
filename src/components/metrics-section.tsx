import { Card, CardContent } from "@/components/ui/card";
import { ActivityExportDialog } from "@/dialogs/activity-export-dialog";
import { getTranslations } from "next-intl/server";
import ActivityCard from "./activity-card";
import RewardDistributionChart from "./metrics/reward-distribution-chart";
import RewardIdsList from "./metrics/reward-ids-list";
import TotalRewardsChart from "./metrics/total-rewards-chart";
import UniqueUsersChart from "./metrics/unique-users-chart";
import RefreshButton from "./refresh-button";

interface MetricsSectionProps {
  community: Community;
}

export default async function MetricsSection({ community }: MetricsSectionProps) {
  const t = await getTranslations("metrics");

  return (
    <div className="space-y-8 pt-6">
      <h2 className="text-2xl font-semibold tracking-tight">{t("title")}</h2>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Unique Users Card */}
        <Card>
          <CardContent className="pt-6 px-6 pb-3">
            <UniqueUsersChart appId={community.id} />
          </CardContent>
        </Card>

        {/* Total Rewards Card */}
        <Card>
          <CardContent className="pt-6 px-6 pb-3">
            <TotalRewardsChart appId={community.id} />
          </CardContent>
        </Card>

        {/* Reward Distribution Card */}
        <Card>
          <CardContent className="pt-6 px-6 pb-3">
            <RewardDistributionChart appId={community.id} />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{t("rewards.title")}</h2>
            <p className="text-sm text-muted-foreground">{t("rewards.description")}</p>
          </div>
          <RewardIdsList appId={community.id} />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-semibold tracking-tight">{t("activity.title")}</h2>
                <RefreshButton />
              </div>
              <p className="text-sm text-muted-foreground">{t("activity.description")}</p>
            </div>
            <ActivityExportDialog community={community} />
          </div>
          <div className="rounded-xl text-card-foreground shadow-sm border bg-card/40">
            <div className="p-6">
              <ActivityCard rewards={community.rewards} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
