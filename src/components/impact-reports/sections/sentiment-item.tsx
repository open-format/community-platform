"use client";

import { SentimentItem } from "../types";
import { Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { DetailedViewModal } from "./detailed-view-modal";
import { useState } from "react";

interface SentimentItemProps {
  item: SentimentItem;
  type: 'excited' | 'frustrated';
}

export function SentimentItemComponent({ item, type }: SentimentItemProps) {
  const t = useTranslations("ImpactReports.sentiment");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">{item.title}</h4>
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
          {t("userCount", { count: item.users.length })}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{item.description}</p>
      <DetailedViewModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={item.title}
        description={item.description}
        evidence={item.evidence}
        translationKey="sentiment"
      />
    </div>
  );
} 