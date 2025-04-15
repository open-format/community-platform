"use client";

import { TopContributor } from "../types";
import { Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { DetailedViewModal } from "./detailed-view-modal";
import { useState } from "react";

interface ContributorItemProps {
  contributor: TopContributor;
}

export function ContributorItemComponent({ contributor }: ContributorItemProps) {
  const t = useTranslations("ImpactReports.contributors");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">{contributor.username}</h4>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            title={t("viewDetails")}
            onClick={() => setIsOpen(true)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
        <span className="text-sm text-muted-foreground">
          {t("messageCount", { count: contributor.messageCount })}
        </span>
      </div>
      <DetailedViewModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={contributor.username}
        description={`${t("messageCount", { count: contributor.messageCount })}`}
        translationKey="contributors"
      />
    </div>
  );
} 