"use client";

import { KeyTopic } from "../types";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { TopicItemComponent } from "./topic-item";
import { ViewAllModal } from "./view-all-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hash, MessageSquare, Eye } from "lucide-react";
import { DetailedViewModal } from "./detailed-view-modal";

interface KeyTopicsProps {
  topics: KeyTopic[];
}

export function KeyTopics({ topics }: KeyTopicsProps) {
  const t = useTranslations("ImpactReports.topics");
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<KeyTopic | null>(null);

  if (!topics.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            {t("title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border p-4 text-center">
            {t("noData")}
          </div>
        </CardContent>
      </Card>
    );
  }

  const columns = [
    {
      key: "topic" as const,
      title: t("title"),
      sortable: true,
      render: (topic: KeyTopic) => (
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{topic.topic}</span>
        </div>
      )
    },
    {
      key: "messageCount" as const,
      title: t("messageCount", { count: undefined }),
      sortable: true,
      render: (topic: KeyTopic) => (
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <span>{topic.messageCount}</span>
        </div>
      )
    },
    {
      key: "evidence" as const,
      title: t("evidenceCount", { count: undefined }),
      render: (topic: KeyTopic) => (
        <span>{t("evidenceCount", { count: topic.evidence.length })}</span>
      )
    },
    {
      key: "actions" as const,
      title: "",
      render: (topic: KeyTopic) => (
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8"
          onClick={() => setSelectedTopic(topic)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      )
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            {topics.slice(0, 3).map((topic) => (
              <TopicItemComponent key={topic.topic} topic={topic} />
            ))}
          </div>
          {topics.length > 3 && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setIsViewAllOpen(true)}
              >
                {t("viewAll")}
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      <ViewAllModal
        isOpen={isViewAllOpen}
        onClose={() => setIsViewAllOpen(false)}
        items={topics}
        type="topics"
        columns={columns}
        translationKey="topics"
      />

      {selectedTopic && (
        <DetailedViewModal
          isOpen={!!selectedTopic}
          onClose={() => setSelectedTopic(null)}
          title={selectedTopic.topic}
          description={selectedTopic.description}
          evidence={selectedTopic.evidence}
          translationKey="topics"
        />
      )}
    </Card>
  );
} 