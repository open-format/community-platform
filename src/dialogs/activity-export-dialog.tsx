"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ActivityExportForm } from "@/forms/activity-export-form";
import { useState } from "react";

interface ActivityExportDialogProps {
  community: Community;
}

export function ActivityExportDialog({ community }: ActivityExportDialogProps) {
  const t = useTranslations("overview.exportForm");
  const [isOpen, setIsOpen] = useState(false);

  function toggle() {
    setIsOpen((t) => !t);
  }

  return (
    <Dialog open={isOpen} onOpenChange={toggle}>
      <DialogTrigger asChild>
        <Button>{t("exportLabel")}</Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <ActivityExportForm community={community} />
      </DialogContent>
    </Dialog>
  );
}
