"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyTopic } from "../types";
import { ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { TopicItemComponent } from "./topic-item";

interface KeyTopicsProps {
  topics: KeyTopic[];
}

export function KeyTopics({ topics }: KeyTopicsProps) {
  const t = useTranslations("ImpactReports.topics");
  
  if (topics.length === 0) return null;

  const topFive = topics.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topFive.map((topic) => (
            <TopicItemComponent key={topic.topic} topic={topic} />
          ))}
          {topics.length > 5 && (
            <div className="pt-4">
              <Button variant="outline" size="sm" className="w-full">
                {t("viewAll")}
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 