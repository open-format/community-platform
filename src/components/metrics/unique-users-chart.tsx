"use client";

import { fetchUniqueUsersMetrics } from "@/lib/metrics";
import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, subDays } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface UniqueUsersChartProps {
  appId: string;
}

const TIME_RANGES = {
  "7d": { days: 7, label: "Last week" },
  "30d": { days: 30, label: "Last month" },
  "90d": { days: 90, label: "Last 3 months" },
} as const;

type TimeRange = keyof typeof TIME_RANGES;

export default function UniqueUsersChart({ appId }: UniqueUsersChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [percentageChange, setPercentageChange] = useState(0);
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const now = Date.now() * 1000;
    const startTime = (subDays(new Date(), TIME_RANGES[timeRange].days).getTime() * 1000).toString();
    const endTime = now.toString();

    const fetchData = async () => {
      setIsLoading(true);
      const metrics = await fetchUniqueUsersMetrics(appId, startTime, endTime);
      if (metrics) {
        const formattedData = metrics
          .map(metric => {
            const date = new Date(parseInt(metric.timestamp) / 1000000);
            return {
              date: format(date, "yyyy-MM-dd"),
              displayDate: timeRange === "7d" 
                ? format(date, "EEE") 
                : format(date, "MMM d"),
              users: metric.count || 0
            };
          })
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setData(formattedData);

        if (metrics.length > 0) {
          const latest = metrics[metrics.length - 1];
          const total = formattedData.length === 1 
            ? formattedData[0].users 
            : latest.totalCount;
          setTotalUsers(total);
          
          if (formattedData.length > 1) {
            const firstDay = formattedData[0];
            const lastDay = formattedData[formattedData.length - 1];
            const change = ((lastDay.users - firstDay.users) / firstDay.users) * 100;
            setPercentageChange(change);
          } else {
            setPercentageChange(0);
          }
        }
      }
      setIsLoading(false);
    };

    fetchData();
  }, [appId, timeRange]);

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Unique Users</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-8 w-[130px]" />
          </div>
        </div>
        <div className="h-[200px]">
          <Skeleton className="w-full h-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Unique Users</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{totalUsers}</span>
            {percentageChange !== 0 && (
              <span className={`text-sm px-2 py-1 rounded-full ${percentageChange > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(0)}%
              </span>
            )}
          </div>
          <Select 
            value={timeRange} 
            onValueChange={(value: TimeRange) => setTimeRange(value)}
          >
            <SelectTrigger className="h-8 w-[130px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TIME_RANGES).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="uniqueUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="displayDate" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 12 }}
              dy={10}
              interval={0}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 12 }}
              dx={-10}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const date = new Date(payload[0].payload.date + "T00:00:00");
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            {format(date, "MMM d, yyyy")}
                          </span>
                          <span className="font-bold">
                            {payload[0].value} users
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="users"
              stroke="#0EA5E9"
              strokeWidth={2}
              fill="url(#uniqueUsers)"
              dot={{ fill: '#0EA5E9', r: 4 }}
              activeDot={{ r: 6, fill: '#0EA5E9' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 