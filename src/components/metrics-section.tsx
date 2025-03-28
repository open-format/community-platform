"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ActivityExportDialog } from "@/dialogs/activity-export-dialog";
import { fetchPaginatedRewardsByCommunity } from "@/lib/openformat";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import ActivityCard, { ActivityCardSkeleton } from "./activity-card";
import RewardDistributionChart from "./metrics/reward-distribution-chart";
import RewardIdsList from "./metrics/reward-ids-list";
import TotalRewardsChart from "./metrics/total-rewards-chart";
import UniqueUsersChart from "./metrics/unique-users-chart";
import RefreshButton from "./refresh-button";
import { Button, buttonVariants } from "./ui/button";

interface MetricsSectionProps {
  community: Community;
}

export default function MetricsSection({ community }: MetricsSectionProps) {
  const t = useTranslations("metrics");
  const PAGE_SIZE = 5;
  const [page, setPage] = useState(0);

  const {
    data: rewards,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["rewards", community.id, page],
    queryFn: () => fetchPaginatedRewardsByCommunity(community.id, PAGE_SIZE, page * PAGE_SIZE),
  });

  // Check if there might be more data
  const hasMore = rewards && rewards.length >= PAGE_SIZE;

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
              {isLoading ? <ActivityCardSkeleton /> : <ActivityCard rewards={rewards || []} />}
              <div className="flex items-center space-x-2 justify-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => setPage((old) => Math.max(old - 1, 0))}
                  disabled={page === 0}
                  className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-secondary"
                >
                  Previous
                </Button>

                <div className={buttonVariants({ variant: "outline" })}>{page + 1}</div>

                <Button
                  variant="outline"
                  onClick={() => {
                    if (hasMore) {
                      setPage((old) => old + 1);
                    }
                  }}
                  disabled={!hasMore}
                  className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-secondary"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
