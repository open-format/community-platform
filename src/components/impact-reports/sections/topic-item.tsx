"use client";

import { KeyTopic } from "../types";
import { Eye, MessageSquare, Hash } from "lucide-react";
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
    <div className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors h-[104px]">
      <div className="flex flex-col justify-between h-full">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <h4 className="font-medium">{topic.topic}</h4>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8"
                onClick={handleViewDetails}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {topic.messageCount}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">{topic.description}</p>
        </div>
        <div className="flex justify-end items-center">
          <div className="text-xs text-muted-foreground">
            {t("evidenceCount", { count: topic.evidence.length })}
          </div>
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