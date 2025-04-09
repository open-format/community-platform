import { ImpactReport } from "@/components/impact-reports/types";
import { Card, CardContent } from "@/components/ui/card";
import { ActivityAnalysis } from "@/components/impact-reports/sections/activity-analysis";
import { TopContributors } from "@/components/impact-reports/sections/top-contributors";
import { KeyTopics } from "@/components/impact-reports/sections/key-topics";
import { SentimentAnalysis } from "@/components/impact-reports/sections/sentiment-analysis";
import { NextSteps } from "@/components/impact-reports/sections/next-steps";
import { getTranslations } from "next-intl/server";
import config from "@/constants/config";

async function getReport(id: string) {
  try {
    const response = await fetch(
      `${config.COMMUNITY_AGENT_API_URL}/reports/impact/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${config.COMMUNITY_AGENT_AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch report: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const reportData = data.report;
    
    const transformedData: ImpactReport = {
      endDate: reportData.endDate || Date.now(),
      startDate: reportData.startDate || Date.now() - (30 * 24 * 60 * 60 * 1000),
      summaryId: reportData.summaryId || id,
      timestamp: reportData.timestamp || Date.now(),
      platformId: reportData.platformId || '',
      messageCount: reportData.messageCount || 0,
      uniqueUserCount: reportData.uniqueUserCount || 0,
      overview: {
        totalMessages: reportData.overview?.totalMessages || reportData.messageCount || 0,
        activeChannels: reportData.overview?.activeChannels || (Array.isArray(reportData.channelBreakdown) ? reportData.channelBreakdown.length : 0),
        uniqueUsers: reportData.overview?.uniqueUsers || reportData.uniqueUserCount || 0
      },
      dailyActivity: Array.isArray(reportData.dailyActivity) ? reportData.dailyActivity : [],
      channelBreakdown: Array.isArray(reportData.channelBreakdown) ? reportData.channelBreakdown : [],
      topContributors: Array.isArray(reportData.topContributors) ? reportData.topContributors : [],
      keyTopics: Array.isArray(reportData.keyTopics) ? reportData.keyTopics : [],
      userSentiment: reportData.userSentiment || {
        excitement: [],
        frustrations: []
      }
    };
    
    return transformedData;
  } catch (error) {
    throw error;
  }
}

export default async function ReportPage({ params }: { params: { id: string } }) {
  const t = await getTranslations("ImpactReports");
  
  try {
    const report: ImpactReport = await getReport(params.id);
    
    if (!report) {
      throw new Error(t("noData"));
    }

    if (!report.overview || typeof report.overview !== 'object') {
      throw new Error('Invalid report data: missing or invalid overview section');
    }

    const { totalMessages, activeChannels, uniqueUsers } = report.overview;
    
    if (typeof totalMessages !== 'number' || 
        typeof activeChannels !== 'number' || 
        typeof uniqueUsers !== 'number') {
      throw new Error('Invalid report data: missing required numeric values in overview');
    }
    
    return (
      <div className="space-y-6 p-4">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">{t("overview.totalMessages")}</h3>
                <p className="text-2xl font-bold">{totalMessages}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">{t("overview.activeChannels")}</h3>
                <p className="text-2xl font-bold">{activeChannels}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">{t("overview.uniqueParticipants")}</h3>
                <p className="text-2xl font-bold">{uniqueUsers}</p>
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
          {report.topContributors?.length > 0 && <TopContributors contributors={report.topContributors} />}
          {report.keyTopics?.length > 0 && <KeyTopics topics={report.keyTopics} />}
        </div>

        {report.userSentiment && (
          <SentimentAnalysis sentiment={report.userSentiment} />
        )}
        <NextSteps />
      </div>
    );
  } catch (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">{t("errors.error", { error: error instanceof Error ? error.message : 'Unknown error' })}</p>
          </CardContent>
        </Card>
      </div>
    );
  }
} 