// src/hooks/useRewardRecommendations.ts
"use client";

import type { RewardRecommendation } from "@/app/(authenticated)/communities/[slug]/overview/components/columns";
import { deleteRewardRecommendation } from "@/lib/openformat";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface PaginatedRecommendationsResponse {
  rewards: RewardRecommendation[];
  total: number;
  limit: number;
  offset: number;
}

export function useRewardRecommendations(
  communityId: string,
  platformId: string,
  limit = 10,
  offset = 0,
) {
  const t = useTranslations("overview.rewardRecommendations");
  const queryClient = useQueryClient();

  // Query for fetching recommendations
  const {
    data,
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ["recommendations", communityId, limit, offset],
    queryFn: async (): Promise<PaginatedRecommendationsResponse> => {
      const response = await fetch(
        `/api/recommendations/get?communityId=${communityId}&platformId=${platformId}&limit=${limit}&offset=${offset}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }

      const responseData = await response.json();

      return responseData.data;
    },
    // Refetch every 30 seconds to keep data fresh
    refetchInterval: 30000,
    // Retry failed requests 3 times
    retry: 3,
    // Keep data fresh for 1 minute
    staleTime: 60000,
  });

  // Extract recommendations and pagination info from response
  const recommendations = data?.rewards || [];
  const total = data?.total || 0;

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
      toast.success(t("successRejectingRewardRecommendation", { summary: recommendation.summary }));
      // Invalidate all recommendation queries to refetch data
      queryClient.invalidateQueries({
        queryKey: ["recommendations", communityId],
      });
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
    total,
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
