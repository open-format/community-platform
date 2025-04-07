"use client";

import { KeyTopic } from "../types";
import { ExternalLink, MessageSquare, Hash } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DetailedViewModal } from "./detailed-view-modal";
import { useState } from "react";

interface TopicItemProps {
  topic: KeyTopic;
}

export function TopicItemComponent({ topic }: TopicItemProps) {
  const t = useTranslations("ImpactReports.topics");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-3 p-4 rounded-lg border bg-card hover:bg-accent transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hash className="h-5 w-5 text-muted-foreground" />
          <h4 className="font-medium">{topic.topic}</h4>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          {topic.messageCount}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2">{topic.description}</p>
      <div className="flex justify-between items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8"
          onClick={handleViewDetails}
        >
          {t("viewDetails")}
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
        <div className="text-xs text-muted-foreground">
          {t("evidenceCount", { count: topic.evidence.length })}
        </div>
      </div>
      <DetailedViewModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={topic.topic}
        description={topic.description}
        evidence={topic.evidence}
        translationKey="topics"
      />
    </div>
  );
} 