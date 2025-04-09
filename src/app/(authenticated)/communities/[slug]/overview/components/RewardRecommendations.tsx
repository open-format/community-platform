"use client";

import { useRecommendations } from "@/hooks/useRecommendations";
import { useCallback, useState } from "react";
import RecommendationsTable from "./RecommendationsTable";
import RejectDialog from "./RejectDialog";
import RewardDialog from "./RewardDialog";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function RewardRecommendations() {
  // Component state for managing dialogs and selected recommendations
  const t = useTranslations( "overview.rewardRecommendations" );
  const [showRejectDialog, setShowRejectDialog] = useState<boolean>( false );
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<RewardRecommendation | null>( null );
  const [rejectingRecommendation, setRejectingRecommendation] =
    useState<RewardRecommendation | null>( null );
  const {recommendations, confirmRecommendation, isConfirming, rejectRecommendation, isRejecting} =
    useRecommendations();

  const handleReject = (recommendation: RewardRecommendation) => {
    setRejectingRecommendation( recommendation );
    setShowRejectDialog( true );
  };

  async function handleRejectConfirm() {
    // Here you would call your API to reject the recommendation
    const response = await rejectRecommendation( rejectingRecommendation );

    if (response) {
      setShowRejectDialog( false );
      toast.success( t( "successConfirmingRewardRecommendation" ), {
        duration: 5000,
        dismissible: true,
      } );
    } else {
      toast.error( t( "errorRejectingRewardRecommendation" ), {
        duration: 5000,
        dismissible: true,
      } );
    }
  }

  /**
   * Function to open reward dialog
   */
  const openRewardDialog = useCallback(
    (recommendation: RewardRecommendation) => {
      setSelectedRecommendation( recommendation );
    },
    [setSelectedRecommendation]
  );

  /**
   * Function to close reward dialog
   */
  const closeRewardDialog = useCallback( () => {
    setSelectedRecommendation( null );
  }, [setSelectedRecommendation] );

  /**
   * Function to confirm reward dialog
   */
  const confirmReward = useCallback(
    (data: object) => {
      console.log( "Confirming reward:", {
        ...selectedRecommendation,
        ...data,
      } );
      confirmRecommendation().then( () => {
        setSelectedRecommendation( null );
      } );
    },
    [confirmRecommendation, selectedRecommendation]
  );

  return (
    <div className="">
      <RecommendationsTable
        recommendations={recommendations}
        onReward={openRewardDialog}
        onReject={handleReject}
      />
      <RejectDialog
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        onConfirm={handleRejectConfirm}
        isRejecting={isRejecting}
      />

      {selectedRecommendation && (
        <RewardDialog
          {...selectedRecommendation}
          submitting={isConfirming}
          onClose={closeRewardDialog}
          onConfirm={confirmReward}
        />
      )}
    </div>
  );
}
