"use client";

import { useState } from "react";
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
}

export default function RejectDialog({
  open,
  onOpenChange,
  onConfirm,
}: RejectDialogProps) {
  const t = useTranslations("overview.rewardRecommendations");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  function handleConfirm() {
    setIsSubmitting(true);
    // Here you would call your API to reject the recommendation
    // For now, we'll just simulate a delay
    setTimeout(() => {
      setIsSubmitting(false);
      onConfirm();
      onOpenChange(false);
    }, 1000);
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("absolutelySure")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("absolutelySureDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </AlertDialogCancel>
          {isSubmitting ? (
            <AlertDialogAction disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
              {t("deletingRewardRecommendation")}
            </AlertDialogAction>
          ) : (
            <AlertDialogAction onClick={handleConfirm}>
              {t("continue")}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
