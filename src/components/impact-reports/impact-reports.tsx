"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { ActivityAnalysis } from "./sections/activity-analysis";
import { KeyTopics } from "./sections/key-topics";
import { SentimentAnalysis } from "./sections/sentiment-analysis";
import { TopContributors } from "./sections/top-contributors";

interface ImpactReportsProps {
  snapshot: any;
}

export default function ImpactReports({ snapshot }: ImpactReportsProps) {
  const t = useTranslations("ImpactReports");

  return (
    <div className="space-y-6 p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">
                {t("overview.totalMessages")}
              </h3>
              <p className="text-2xl font-bold">{snapshot.overview.totalMessages}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">
                {t("overview.activeChannels")}
              </h3>
              <p className="text-2xl font-bold">{snapshot.overview.activeChannels}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">
                {t("overview.uniqueParticipants")}
              </h3>
              <p className="text-2xl font-bold">{snapshot.overview.uniqueUsers}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <ActivityAnalysis
        dailyActivity={snapshot.dailyActivity}
        channelBreakdown={snapshot.channelBreakdown}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopContributors contributors={snapshot.topContributors} />
        <KeyTopics topics={snapshot.keyTopics} />
      </div>

      <SentimentAnalysis sentiment={snapshot.userSentiment} />
    </div>
  );
}
