"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from 'next-intl';
import UniqueUsersChart from "./metrics/unique-users-chart";
import TotalRewardsChart from "./metrics/total-rewards-chart";
import RewardDistributionChart from "./metrics/reward-distribution-chart";
import RewardIdsList from "./metrics/reward-ids-list";
import Activity from "./activity";
import { useEffect, useState } from "react";
import { fetchCommunity } from "@/lib/openformat";

interface MetricsSectionProps {
  appId: string;
}

export default function MetricsSection({ appId }: MetricsSectionProps) {
  const t = useTranslations('metrics');
  const [communityData, setCommunityData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const data = await fetchCommunity(appId);
      setCommunityData(data);
    }
    fetchData();
  }, [appId]);

  return (
    <div className="space-y-8 pt-6">
      <h2 className="text-2xl font-semibold tracking-tight">Community insight</h2>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Unique Users Card */}
        <Card>
          <CardContent className="pt-6 px-6 pb-3">
            <UniqueUsersChart appId={appId} />
          </CardContent>
        </Card>

        {/* Total Rewards Card */}
        <Card>
          <CardContent className="pt-6 px-6 pb-3">
            <TotalRewardsChart appId={appId} />
          </CardContent>
        </Card>

        {/* Reward Distribution Card */}
        <Card>
          <CardContent className="pt-6 px-6 pb-3">
            <RewardDistributionChart appId={appId} />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Rewards</h2>
            <p className="text-sm text-muted-foreground">A list of all the rewards in this community.</p>
          </div>
          <div className="rounded-xl text-card-foreground shadow-sm border bg-card/40">
            <div className="p-6">
              <RewardIdsList appId={appId} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Activity</h2>
            <p className="text-sm text-muted-foreground">A list of the most recent rewards in this community.</p>
          </div>
          <div className="rounded-xl text-card-foreground shadow-sm border bg-card/40">
            <div className="p-6">
              <Activity rewards={communityData?.rewards || []} showUserAddress={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
