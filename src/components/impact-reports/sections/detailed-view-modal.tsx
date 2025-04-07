"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface DetailedViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  evidence?: string[];
  translationKey: string;
}

export function DetailedViewModal({
  isOpen,
  onClose,
  title,
  description,
  evidence,
  translationKey,
}: DetailedViewModalProps) {
  const t = useTranslations(`ImpactReports.${translationKey}`);

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {evidence && evidence.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">{t("viewEvidence")}</h4>
              <div className="flex flex-wrap gap-2">
                {evidence.map((link) => (
                  <Link
                    key={link}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    {t("viewEvidence")}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 