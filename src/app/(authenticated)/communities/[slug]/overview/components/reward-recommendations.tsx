"use client";

import { useRewardRecommendations } from "@/hooks/useRewardRecommendations";
import type { PaginationState } from "@tanstack/react-table";
import { useState } from "react";
import RecommendationsTable from "./recommendations-table";

export default function RewardRecommendations({
  community,
}: {
  community: Community;
}) {
  // Manage pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Calculate limit and offset from pagination state
  const limit = pagination.pageSize;
  const offset = pagination.pageIndex * pagination.pageSize;

  const { recommendations, total, deleteRecommendation, isLoading, isDeleting } = useRewardRecommendations(
    community?.id,
    community?.platformConnections[0]?.platformId,
    limit,
    offset
  );

  // Handle reward action (placeholder - implement based on existing logic)
  const handleReward = (recommendation: RewardRecommendation) => {
    // TODO: Implement reward logic
    console.log("Rewarding recommendation:", recommendation);
  };

  return (
    <div className="space-y-4">
      <RecommendationsTable
        community={community}
        recommendations={recommendations}
        deleteRecommendation={deleteRecommendation}
        onReward={handleReward}
        isDeleting={isDeleting}
        isLoading={isLoading}
        pagination={pagination}
        onPaginationChange={setPagination}
        totalCount={total}
      />
    </div>
  );
}

