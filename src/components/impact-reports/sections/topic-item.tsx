"use client";

import { KeyTopic } from "../types";
import { Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { DetailedViewModal } from "./detailed-view-modal";
import { useState } from "react";

interface TopicItemProps {
  topic: KeyTopic;
}

export function TopicItemComponent({ topic }: TopicItemProps) {
  const t = useTranslations("ImpactReports.topics");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">{topic.topic}</h4>
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
          {t("messageCount", { count: topic.messageCount })}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{topic.description}</p>
      <DetailedViewModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={topic.topic}
        description={topic.description}
        evidence={topic.evidence}
        translationKey="topics"
      />
    </div>
  );
} 