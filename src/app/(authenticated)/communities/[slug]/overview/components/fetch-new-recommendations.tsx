"use client";

import { Button } from "@/components/ui/button";
import { useRewardRecommendationsJob } from "@/hooks/useRewardRecommendationsJob";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface FetchNewRecommendationsProps {
  communityId: string;
}

export default function FetchNewRecommendations({ communityId }: FetchNewRecommendationsProps) {
  console.log("communityId", communityId);
  const t = useTranslations("overview.rewardRecommendations");
  const { generateRecommendations, isGenerating, jobStatus, isCheckingStatus } =
    useRewardRecommendationsJob(communityId);

  const isLoading = isGenerating || isCheckingStatus;
  const buttonText = isLoading
    ? "Generating..."
    : jobStatus === "completed"
      ? "Generated"
      : "Generate";

  return (
    <Button
      onClick={generateRecommendations}
      disabled={isLoading}
      variant="outline"
      className="w-full"
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {buttonText}
    </Button>
  );
}
