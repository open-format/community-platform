"use client";

import {
  generateRewardRecommendations,
  getRewardRecommendationJobStatus,
  revalidate,
} from "@/lib/openformat";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface JobStatus {
  status: "running" | "completed" | "failed";
  message?: string;
}

export function useRewardRecommendationsJob(communityId: string) {
  const generateMutation = useMutation({
    mutationFn: async () => {
      console.log("communityIdHook", communityId);
      const response = await generateRewardRecommendations(communityId);
      if (!response || "error" in response) {
        throw new Error(
          "error" in response ? response.error : "Failed to generate recommendations",
        );
      }
      console.log("response", response);
      return response;
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate recommendations");
    },
  });

  const { data: jobStatus, isLoading: isCheckingStatus } = useQuery({
    queryKey: ["rewardRecommendationsJob", generateMutation.data?.jobId],
    queryFn: async () => {
      if (!generateMutation.data?.jobId) return null;
      const status = await getRewardRecommendationJobStatus(generateMutation.data.jobId);
      console.log("status", status);
      return status;
    },
    enabled: false,
    refetchInterval: 2000,
  });

  // Handle job status changes
  if (jobStatus?.status === "completed") {
    revalidate();
    toast.success("New recommendations generated successfully");
  } else if (jobStatus?.status === "failed") {
    toast.error("Failed to generate recommendations");
  }

  return {
    generateRecommendations: generateMutation.mutate,
    isGenerating: generateMutation.isPending,
    jobStatus: jobStatus?.status,
    isCheckingStatus,
  };
}
