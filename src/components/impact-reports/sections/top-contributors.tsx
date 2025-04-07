"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopContributor } from "../types";
import { ExternalLink, MessageSquare, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ImpactReportAvatar } from "./impact-report-avatar";
import { useState } from "react";
import { ViewAllModal } from "./view-all-modal";

interface TopContributorsProps {
  contributors: TopContributor[];
}

function ContributorItemComponent({ contributor, rank }: { contributor: TopContributor; rank: number }) {
  const t = useTranslations("ImpactReports.contributors");

  return (
    <div className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ImpactReportAvatar username={contributor.username} rank={rank} />
          <div className="space-y-1">
            <h4 className="font-medium">{contributor.username}</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span>{t("messageCount", { count: contributor.messageCount })}</span>
            </div>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8"
          onClick={() => {}}
        >
          {t("viewDetails")}
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function TopContributors({ contributors }: TopContributorsProps) {
  const t = useTranslations("ImpactReports.contributors");
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);
  
  if (contributors.length === 0) return null;

  // Convert contributors to format expected by ViewAllModal
  const contributorsForModal = contributors.map(contributor => ({
    topic: contributor.username,
    messageCount: contributor.messageCount,
    description: t("messageCount", { count: contributor.messageCount }),
    evidence: [] 
  }));

  const topFive = contributors.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            {topFive.map((contributor, index) => (
              <ContributorItemComponent 
                key={contributor.username} 
                contributor={contributor} 
                rank={index + 1}
              />
            ))}
          </div>
          {contributors.length > 5 && (
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
        topics={contributorsForModal}
      />
    </Card>
  );
} 