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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const data = await fetchCommunity(appId);
        setCommunityData(data);
      } catch (error) {
        console.error('Error fetching community data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [appId]);

  return (
    <div className="space-y-8 pt-6">
      <h2 className="text-2xl font-semibold tracking-tight">{t('title')}</h2>
      
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
            <h2 className="text-2xl font-semibold tracking-tight">{t('rewards.title')}</h2>
            <p className="text-sm text-muted-foreground">{t('rewards.description')}</p>
          </div>
          <RewardIdsList appId={appId} />
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{t('activity.title')}</h2>
            <p className="text-sm text-muted-foreground">{t('activity.description')}</p>
          </div>
          <div className="rounded-xl text-card-foreground shadow-sm border bg-card/40">
            <div className="p-6">
              <Activity rewards={communityData?.rewards || []} showUserAddress={true} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
