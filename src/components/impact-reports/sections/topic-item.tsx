"use client";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Eye, Hash, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(false);

  const handleViewDetails = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Check if description is long enough to need truncation
  const shouldShowToggle = topic.description.length > 100;

  return (
    <div className={`p-4 rounded-lg border bg-card hover:bg-accent transition-all duration-200 ${isExpanded ? 'min-h-[104px]' : 'h-[104px]'}`}>
      <div className="flex flex-col justify-between h-full">
        <div className="space-y-2 flex-1">
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
                  key={evidence}
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
          <div className="space-y-1">
            <p className={`text-sm text-muted-foreground ${!isExpanded && shouldShowToggle ? 'line-clamp-1' : ''}`}>
              {topic.description}
            </p>
            {shouldShowToggle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleExpanded}
                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              >
                <span className="flex items-center gap-1">
                  {isExpanded ? (
                    <>
                      Show Less <ChevronUp className="h-3 w-3" />
                    </>
                  ) : (
                    <>
                      Show More <ChevronDown className="h-3 w-3" />
                    </>
                  )}
                </span>
              </Button>
            )}
          </div>
        </div>
        <div className="flex justify-end items-center mt-2">
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
