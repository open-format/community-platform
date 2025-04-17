"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface RejectDialogProps {
  onConfirm: () => void;
  children: React.ReactNode;
}

export default function RejectDialog({ onConfirm, children }: RejectDialogProps) {
  const t = useTranslations("overview.rewardRecommendations");
  const [open, setOpen] = useState(false);

  function toggle() {
    setOpen(!open);
  }

  function handleConfirm() {
    onConfirm();
  }

  return (
    <AlertDialog open={open} onOpenChange={toggle}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("absolutelySure")}</AlertDialogTitle>
          <AlertDialogDescription>{t("absolutelySureDescription")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={toggle}>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>{t("continue")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
