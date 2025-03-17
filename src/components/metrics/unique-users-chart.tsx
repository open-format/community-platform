"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from 'next-intl';
import { fetchUniqueUsersMetrics } from "@/lib/metrics";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
    ChartContainer, 
    ChartTooltip, 
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent 
  } from "@/components/ui/chart";
  import { 
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
    CartesianGrid,
    Tooltip
  } from 'recharts';
interface UniqueUsersChartProps {
  appId: string;
}

const TIME_RANGES = {
  "7d": { days: 7 },
  "30d": { days: 30 },
  "90d": { days: 90 },
} as const;

export default function UniqueUsersChart({ appId }: UniqueUsersChartProps) {
  const t = useTranslations('metrics');
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<keyof typeof TIME_RANGES>("7d");

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const now = Math.floor(Date.now() / 1000); // Current time in seconds
        const endTime = (now * 1000000).toString(); // Convert to microseconds
        const startTime = ((now - (TIME_RANGES[timeRange].days * 24 * 60 * 60)) * 1000000).toString(); // Convert to microseconds
        
        const result = await fetchUniqueUsersMetrics(appId, startTime, endTime);
        if (result) {
          const formattedData = result.map(item => ({
            name: new Date(Math.floor(parseInt(item.timestamp) / 1000000) * 1000).toLocaleDateString(), // Convert microseconds to milliseconds
            value: parseInt(item.totalCount)
          }));
          setData(formattedData);
        }
      } catch (error) {
        console.error('Error fetching unique users data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [appId, timeRange]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            {t('uniqueUsers.title')}
            <Skeleton className="h-10 w-[120px]" />
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <Skeleton className="w-full h-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          {t('uniqueUsers.title')}
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TIME_RANGES).map(([key]) => (
                <SelectItem key={key} value={key}>{t(`timeRanges.${key}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ChartContainer
          config={{
            users: {
              label: t('uniqueUsers.title'),
              theme: {
                light: "hsl(var(--primary))",
                dark: "hsl(var(--primary))",
              },
            },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name"
                label={{ value: t('uniqueUsers.xAxisLabel'), position: "insideBottom", offset: -10 }}
              />
              <YAxis
                label={{ value: t('uniqueUsers.yAxisLabel'), angle: -90, position: "insideLeft" }}
              />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
} 