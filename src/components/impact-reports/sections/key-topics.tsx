"use client";

import { KeyTopic } from "../types";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { TopicItemComponent } from "./topic-item";
import { ViewAllModal } from "./view-all-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hash } from "lucide-react";

interface KeyTopicsProps {
  topics: KeyTopic[];
}

export function KeyTopics({ topics }: KeyTopicsProps) {
  const t = useTranslations("ImpactReports.topics");
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);

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
        topics={topics}
      />
    </Card>
  );
} 