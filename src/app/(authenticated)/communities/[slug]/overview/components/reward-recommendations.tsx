"use client";

import { useRewardRecommendations } from "@/hooks/useRewardRecommendations";
import RecommendationsTable from "./recommendations-table";

export default function RewardRecommendations({
  community,
}: {
  community: Community;
}) {
  const { recommendations, deleteRecommendation, isLoading, isDeleting } = useRewardRecommendations(
    community?.id,
    community?.platformConnections[0]?.platformId,
  );

  return (
    <div className="space-y-4">
      <RecommendationsTable
        community={community}
        recommendations={recommendations}
        deleteRecommendation={deleteRecommendation}
        isDeleting={isDeleting}
        isLoading={isLoading}
      />
    </div>
  );
}
