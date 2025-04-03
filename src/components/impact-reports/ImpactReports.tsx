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

export function ImpactReports({ communityId, agentId }: ImpactReportsProps) {
  const t = useTranslations("ImpactReports");
  const [report, setReport] = useState<ImpactReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const dummyData = {
          endDate: 1743507912139,
          overview: {
            uniqueUsers: 48,
            totalMessages: 275,
            activeChannels: 9
          },
          keyTopics: [
            {
              topic: "Blockchain Development Skills and Opportunities",
              evidence: [
                "https://discord.com/channels/856517297141317643/888806875347435590/1354252855292199073",
                "https://discord.com/channels/856517297141317643/888806875347435590/1352890775922544660",
                "https://discord.com/channels/856517297141317643/888806875347435590/1352034961502502985",
                "https://discord.com/channels/856517297141317643/888806875347435590/1351807378906939425"
              ],
              description: "Users are sharing their skills and experience as blockchain developers, particularly in Solidity and Rust, and expressing interest in new opportunities.",
              messageCount: 6
            }
          ],
          startDate: 1711885512139,
          summaryId: "52c330a1-2261-4191-888e-d26579dadc30",
          timestamp: 1743508637143,
          platformId: "856517297141317643",
          messageCount: 275,
          dailyActivity: [
            {
              date: "2025-03-18",
              uniqueUsers: 8,
              messageCount: 32
            }
          ],
          userSentiment: {
            excitement: [
              {
                title: "Game Night",
                users: ["zubairaurorasupportteam", "zealous_flamingo_90664"],
                evidence: [
                  "https://discord.com/channels/856517297141317643/888806875347435590/1352249151068307498",
                  "https://discord.com/channels/856517297141317643/888806875347435590/1352585173413400616"
                ],
                description: "Users are looking forward to the upcoming game night and expressing their enthusiasm for participating."
              }
            ],
            frustrations: [
              {
                title: "Lack of Consideration for Suggestions",
                users: ["femmie8084"],
                evidence: [
                  "https://discord.com/channels/856517297141317643/888806875347435590/1354901926466293811"
                ],
                description: "femmie8084 expresses frustration about suggestions not being considered."
              }
            ]
          },
          topContributors: [
            {
              username: "zubairaurorasupportteam",
              messageCount: 49
            }
          ],
          uniqueUserCount: 48,
          channelBreakdown: [
            {
              channelName: "💬｜general-chat",
              uniqueUsers: 41,
              messageCount: 219
            }
          ]
        };
        
        setReport(dummyData);
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