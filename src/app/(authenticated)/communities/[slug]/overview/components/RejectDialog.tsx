"use client";

import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslations } from "next-intl";

interface RejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isRejecting: boolean;
}

export default function RejectDialog({
  open,
  onOpenChange,
  onConfirm,
  isRejecting
}: RejectDialogProps) {
  const t = useTranslations( "overview.rewardRecommendations" );

  function handleConfirm() {
    // Here you would call your API to reject the recommendation
    onConfirm();
  }

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t( "absolutelySure" )}</AlertDialogTitle>
          <AlertDialogDescription>
            {t( "absolutelySureDescription" )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRejecting} onClick={() => onOpenChange( false )}>
            {t( "cancel" )}
          </AlertDialogCancel>
          {isRejecting ? (
            <AlertDialogAction disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin"/>{" "}
              {t( "deletingRewardRecommendation" )}
            </AlertDialogAction>
          ) : (
            <AlertDialogAction onClick={handleConfirm}>
              {t( "continue" )}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
