"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyActivity, ChannelBreakdown } from "../types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslations } from "next-intl";

interface ActivityAnalysisProps {
  dailyActivity: DailyActivity[];
  channelBreakdown: ChannelBreakdown[];
}

export function ActivityAnalysis({ dailyActivity, channelBreakdown }: ActivityAnalysisProps) {
  const t = useTranslations("ImpactReports.activity");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Daily Activity Chart */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">{t("dailyActivity")}</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyActivity}>
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [value, "Messages"]}
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <Bar 
                  dataKey="messageCount" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channel Breakdown */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">{t("channelBreakdown")}</h3>
          <div className="space-y-4">
            {channelBreakdown.map((channel) => (
              <div key={channel.channelName} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">{channel.channelName}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("users")}: {channel.uniqueUsers}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{t("messages")}: {channel.messageCount}</p>
                  <p className="text-sm text-muted-foreground">messages</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 