"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from 'next-intl';
import UniqueUsersChart from "./metrics/unique-users-chart";
import TotalRewardsChart from "./metrics/total-rewards-chart";
import RewardDistributionChart from "./metrics/reward-distribution-chart";
import RewardIdsList from "./metrics/reward-ids-list";

interface MetricsSectionProps {
  appId: string;
}

export default function MetricsSection({ appId }: MetricsSectionProps) {
  const t = useTranslations('metrics');

  return (
    <div className="space-y-8 pt-6">
      <h2 className="text-2xl font-semibold tracking-tight">Community insight</h2>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Unique Users Card */}
        <Card className="h-[400px]">
          <CardContent className="p-6">
            <UniqueUsersChart appId={appId} />
          </CardContent>
        </Card>

        {/* Total Rewards Card */}
        <Card className="h-[400px]">
          <CardContent className="p-6">
            <TotalRewardsChart appId={appId} />
          </CardContent>
        </Card>

        {/* Reward Distribution Card */}
        <Card className="h-[400px]">
          <CardContent className="p-6">
            <RewardDistributionChart appId={appId} />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-[400px]">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">Rewards</h3>
            <p className="text-sm text-muted-foreground mb-6">A list of all the rewards in this community.</p>
            <RewardIdsList appId={appId} />
          </CardContent>
        </Card>

        <Card className="h-[400px]">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">Activity</h3>
            <p className="text-sm text-muted-foreground mb-6">A list of the most recent rewards in this community</p>
            {/* Activity list will go here */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
