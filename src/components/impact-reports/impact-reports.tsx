"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ImpactReport, ImpactReportsProps } from "./types";
import { useEffect, useState } from "react";
import { ActivityAnalysis } from "./sections/activity-analysis";
import { TopContributors } from "./sections/top-contributors";
import { KeyTopics } from "./sections/key-topics";
import { SentimentAnalysis } from "./sections/sentiment-analysis";
import { NextSteps } from "./sections/next-steps";
import { useTranslations } from "next-intl";
import { generateImpactReportTestData } from "@/lib/test-data";

export function ImpactReports({ communityId, agentId }: ImpactReportsProps) {
  const t = useTranslations("ImpactReports");
  const [report, setReport] = useState<ImpactReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Use test data generator
        const data = generateImpactReportTestData();
        setReport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("errors.loadFailed"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [communityId, agentId, t]);

  if (isLoading) {
    return <div>{t("loading")}</div>;
  }

  if (error) {
    return <div>{t("errors.error", { error })}</div>;
  }

  if (!report) {
    return <div>{t("noData")}</div>;
  }

  return (
    <div className="space-y-6 p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">{t("overview.totalMessages")}</h3>
              <p className="text-2xl font-bold">{report.overview.totalMessages}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">{t("overview.activeChannels")}</h3>
              <p className="text-2xl font-bold">{report.overview.activeChannels}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">{t("overview.uniqueParticipants")}</h3>
              <p className="text-2xl font-bold">{report.overview.uniqueUsers}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <ActivityAnalysis 
        dailyActivity={report.dailyActivity}
        channelBreakdown={report.channelBreakdown}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopContributors contributors={report.topContributors} />
        <KeyTopics topics={report.keyTopics} />
      </div>

      <SentimentAnalysis sentiment={report.userSentiment} />
      <NextSteps />
    </div>
  );
} 