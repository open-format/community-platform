"use client";

import type { RewardRecommendation } from "@/app/(authenticated)/communities/[slug]/overview/components/columns";
import { deleteRewardRecommendation, getRewardRecommendations } from "@/lib/openformat";
import { useCallback, useEffect, useState } from "react";

export function useRecommendations(communityId: string) {
  const [recommendations, setRecommendations] = useState<RewardRecommendation[]>([]);
  const [isRejecting, setIsRejecting] = useState(false);

  const fetchRecommendations = useCallback(async () => {
    try {
      const data = await getRewardRecommendations(communityId);
      if (data && !("error" in data)) {
        setRecommendations(data);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  }, [communityId]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const rejectRecommendation = useCallback(async (recommendation: RewardRecommendation) => {
    try {
      setIsRejecting(true);
      const response = await deleteRewardRecommendation(recommendation.id);
      if (response) {
        setRecommendations((prev) => prev.filter((rec) => rec.id !== recommendation.id));
      }
    } catch (error) {
      console.error("Error rejecting recommendation:", error);
    } finally {
      setIsRejecting(false);
    }
  }, []);

  return {
    recommendations,
    isRejecting,
    rejectRecommendation,
  };
}
