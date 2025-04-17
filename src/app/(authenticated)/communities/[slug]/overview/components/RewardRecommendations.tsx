"use client";

import { deleteRewardRecommendation } from "@/lib/openformat";
import { useTranslations } from "next-intl";
import { startTransition, useState } from "react";
import { toast } from "sonner";
import type { RewardRecommendation } from "./columns";
import RecommendationsTable from "./recommendations-table";

export default function RewardRecommendations({
  community,
  rewardRecommendations,
}: {
  community: Community;
  rewardRecommendations: RewardRecommendation[];
}) {
  const t = useTranslations("overview.rewardRecommendations");
  const [recommendations, setRecommendations] = useState(rewardRecommendations);
  const [isPending, setIsPending] = useState(false);

  const handleReward = async (recommendation: RewardRecommendation) => {
    // TODO: Implement reward functionality
    console.log("Reward recommendation:", recommendation);
  };

  const handleReject = async (recommendation: RewardRecommendation) => {
    try {
      setIsPending(true);
      const response = await deleteRewardRecommendation(recommendation.id);

      if (response) {
        // Optimistically update the UI
        setRecommendations((prev) => prev.filter((rec) => rec.id !== recommendation.id));

        toast.success(
          t("successRejectingRewardRecommendation", {
            name: recommendation.contributor_name,
            summary: recommendation.summary,
          }),
          {
            duration: 5000,
          },
        );
      } else {
        throw new Error("Failed to reject recommendation");
      }
    } catch (error) {
      toast.error(t("errorRejectingRewardRecommendation"), {
        duration: 5000,
      });
      console.error("Error rejecting recommendation:", error);
    } finally {
      setIsPending(false);
    }
  };

  function deleteRecommendation(recommendation: RewardRecommendation) {
    startTransition(async () => {
      try {
        const response = await deleteRewardRecommendation(recommendation.id);
        if (response) {
          setRecommendations((prev) => prev.filter((rec) => rec.id !== recommendation.id));
        } else {
          throw new Error("Failed to delete recommendation");
        }
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message, {
            duration: 5000,
          });
        } else {
          toast.error(t("errorRejectingRewardRecommendation"), {
            duration: 5000,
          });
        }
      }
    });
  }

  return (
    <div className="space-y-4">
      <RecommendationsTable
        community={community}
        recommendations={recommendations}
        deleteRecommendation={deleteRecommendation}
        onReward={handleReward}
        onReject={handleReject}
        isLoading={isPending}
      />
    </div>
  );
}
