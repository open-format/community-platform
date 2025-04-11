"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyActivity, ChannelBreakdown } from "../types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useTranslations } from "next-intl";
import { Activity, MessageSquare, Users } from "lucide-react";

interface ActivityAnalysisProps {
  dailyActivity: DailyActivity[];
  channelBreakdown: ChannelBreakdown[];
}

export function ActivityAnalysis({ dailyActivity, channelBreakdown }: ActivityAnalysisProps) {
  const t = useTranslations("ImpactReports.activity");
  const channelData = channelBreakdown.map(channel => ({
    name: channel.channelName,
    messages: channel.messageCount,
    users: channel.uniqueUsers
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {t("dailyActivity")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyActivity}>
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-sm">
                          <p className="font-medium">{new Date(label).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                          <div className="grid gap-2 mt-2">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" />
                              <span className="text-sm">
                                {payload[0]?.value} messages
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span className="text-sm">
                                {payload[1]?.value} unique users
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar 
                  yAxisId="left"
                  dataKey="messageCount" 
                  name="Messages"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  yAxisId="right"
                  dataKey="uniqueUsers" 
                  name="Unique Users"
                  fill="#FF6B00"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {t("channelBreakdown")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelData} layout="vertical">
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={150}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-sm">
                          <p className="font-medium">{label}</p>
                          <div className="grid gap-2 mt-2">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" />
                              <span className="text-sm">
                                {payload[0]?.value} messages
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span className="text-sm">
                                {payload[1]?.value} unique users
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="messages" 
                  name="Messages"
                  fill="hsl(var(--primary))"
                  radius={[0, 4, 4, 0]}
                />
                <Bar 
                  dataKey="users" 
                  name="Unique Users"
                  fill="#FF6B00"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 