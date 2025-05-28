// src/hooks/useRewardRecommendations.ts
"use client";

import type { RewardRecommendation } from "@/app/(authenticated)/communities/[slug]/overview/components/columns";
import { deleteRewardRecommendation } from "@/lib/openformat";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

export function useRewardRecommendations(communityId: string, platformId: string) {
  const t = useTranslations("overview.rewardRecommendations");
  const queryClient = useQueryClient();

  // Query for fetching recommendations
  const {
    data: recommendations = [],
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ["recommendations", communityId],
    queryFn: async () => {
      const response = await fetch(
        `/api/recommendations/get?communityId=${communityId}&platformId=${platformId}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }

      const data = await response.json();

      return data.data.rewards;
    },
    // Refetch every 30 seconds to keep data fresh
    refetchInterval: 30000,
    // Retry failed requests 3 times
    retry: 3,
    // Keep data fresh for 1 minute
    staleTime: 60000,
  });

  // Mutation for deleting recommendations
  const deleteMutation = useMutation({
    mutationFn: async (recommendation: RewardRecommendation) => {
      const response = await deleteRewardRecommendation(recommendation.id);
      if (!response) {
        throw new Error("Failed to delete recommendation");
      }
      return response;
    },
    onSuccess: (_, recommendation) => {
      // Optimistically update the UI
      queryClient.setQueryData(["recommendations", communityId], (old: RewardRecommendation[]) =>
        old.filter((rec) => rec.id !== recommendation.id),
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : t("errorRejectingRewardRecommendation"),
        { duration: 5000 },
      );
    },
  });

  return {
    // Data
    recommendations,
    // Loading states
    isLoading,
    isDeleting: deleteMutation.isPending,
    // Error states
    error: fetchError,
    // Actions
    deleteRecommendation: deleteMutation.mutate,
    // Refetch function
    refetch: () =>
      queryClient.invalidateQueries({
        queryKey: ["recommendations", communityId],
      }),
  };
}
