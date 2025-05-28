"use client";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Eye, Hash, MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { KeyTopic } from "../types";
import { DetailedViewModal } from "./detailed-view-modal";

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
              {topic.evidence?.map((evidence) => (
                <Link
                  className={buttonVariants({ size: "icon" })}
                  href={evidence}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={evidence.id}
                >
                  <Eye className="h-4 w-4" />
                </Link>
              ))}
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
