"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from 'next-intl';
import UniqueUsersChart from "./metrics/unique-users-chart";
import TotalRewardsChart from "./metrics/total-rewards-chart";

interface MetricsSectionProps {
  appId: string;
}

export default function MetricsSection({ appId }: MetricsSectionProps) {
  const t = useTranslations('metrics');

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <UniqueUsersChart appId={appId} />
        <TotalRewardsChart appId={appId} />
        <Card>
          <CardHeader>
            <CardTitle>{t('rewardDistribution.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Third chart will go here */}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
