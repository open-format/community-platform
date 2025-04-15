import { ActivityAnalysis } from "@/components/impact-reports/sections/activity-analysis";
import { KeyTopics } from "@/components/impact-reports/sections/key-topics";
import { SentimentAnalysis } from "@/components/impact-reports/sections/sentiment-analysis";
import { TopContributors } from "@/components/impact-reports/sections/top-contributors";
import { Card, CardContent } from "@/components/ui/card";
import { fetchReport } from "@/lib/openformat";
import { getTranslations } from "next-intl/server";

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations("ImpactReports");
  const id = (await params).id;
  const report = await fetchReport(id);

  if (!report) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-destructive">{t("errors.loadFailed")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-24">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">
                {t("overview.totalMessages")}
              </h3>
              <p className="text-2xl font-bold">{report.overview?.totalMessages}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">
                {t("overview.activeChannels")}
              </h3>
              <p className="text-2xl font-bold">{report.overview?.activeChannels}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">
                {t("overview.uniqueParticipants")}
              </h3>
              <p className="text-2xl font-bold">{report.overview?.uniqueUsers}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {report.dailyActivity?.length > 0 && report.channelBreakdown?.length > 0 && (
        <ActivityAnalysis
          dailyActivity={report.dailyActivity}
          channelBreakdown={report.channelBreakdown}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {report.topContributors?.length > 0 && (
          <TopContributors contributors={report.topContributors} />
        )}
        {report.keyTopics?.length > 0 && <KeyTopics topics={report.keyTopics} />}
      </div>

      {report.userSentiment && <SentimentAnalysis sentiment={report.userSentiment} />}
    </div>
  );
}
