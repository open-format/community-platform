"use client";

import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { ActivityAnalysis } from "./sections/activity-analysis";
import { KeyTopics } from "./sections/key-topics";
import { SentimentAnalysis } from "./sections/sentiment-analysis";
import { TopContributors } from "./sections/top-contributors";

interface ImpactReportsProps {
  report: any;
}

export default function ImpactReports({ report }: ImpactReportsProps) {
  const t = useTranslations("ImpactReports");

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-6 w-full">
      <Overview title="Total Messages" value={report.overview.totalMessages} />
      <Overview title="Active Channels" value={report.overview.activeChannels} />
      <Overview title="Unique Participants" value={report.overview.uniqueUsers} />

      <div className="col-span-full md:col-span-6">
        <ActivityAnalysis
          dailyActivity={report.dailyActivity}
          channelBreakdown={report.channelBreakdown}
        />
      </div>
      <div className="col-span-full md:col-span-3">
        <TopContributors contributors={report.topContributors} />
      </div>
      <div className="col-span-full md:col-span-3">
        <KeyTopics topics={report.keyTopics} />
      </div>
      <div className="col-span-full md:col-span-6">
        <SentimentAnalysis sentiment={report.userSentiment} />
      </div>
    </div>
  );
}

function Overview({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-800 p-8 flex flex-col items-center shadow-sm col-span-2">
      <Sparkles className="h-6 w-6 text-yellow-400 mb-2" />
      <span className="text-sm text-gray-400 mb-1">{title}</span>
      <span className="text-4xl font-extrabold text-white">{value}</span>
    </div>
  );
}
