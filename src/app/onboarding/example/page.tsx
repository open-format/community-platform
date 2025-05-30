import { CloseTab } from "@/components/close-tab";
import { ActivityAnalysis } from "@/components/impact-reports/sections/activity-analysis";
import { KeyTopics } from "@/components/impact-reports/sections/key-topics";
import { SentimentAnalysis } from "@/components/impact-reports/sections/sentiment-analysis";
import { TopContributors } from "@/components/impact-reports/sections/top-contributors";
import report from "@/constants/report.json";
import { Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function ExampleSnapshotPage() {
  const t = await getTranslations("onboarding");
  return (
    <div className="flex flex-col gap-6 items-center">
      <h1>{t("exampleSnapshot.title")}</h1>
      <p className="text-gray-400 text-lg max-w-2xl mx-auto text-center">
        {t("exampleSnapshot.intro")}
      </p>
      <CloseTab />

      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 w-full">
        <div className="rounded-xl border border-zinc-800 p-8 flex flex-col items-center shadow-sm col-span-2">
          <Sparkles className="h-6 w-6 text-yellow-400 mb-2" />
          <span className="text-sm text-gray-400 mb-1">Total Messages</span>
          <span className="text-4xl font-extrabold text-white">
            {report.overview.totalMessages}
          </span>
        </div>
        <div className="rounded-xl border border-zinc-800 p-8 flex flex-col items-center shadow-sm col-span-2">
          <Sparkles className="h-6 w-6 text-yellow-400 mb-2" />
          <span className="text-sm text-gray-400 mb-1">Active Channels</span>
          <span className="text-4xl font-extrabold text-white">
            {report.overview.activeChannels}
          </span>
        </div>
        <div className="rounded-xl border border-zinc-800 p-8 flex flex-col items-center shadow-sm col-span-2">
          <Sparkles className="h-6 w-6 text-yellow-400 mb-2" />
          <span className="text-sm text-gray-400 mb-1">Unique Participants</span>
          <span className="text-4xl font-extrabold text-white">{report.overview.uniqueUsers}</span>
        </div>
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
    </div>
  );
}
