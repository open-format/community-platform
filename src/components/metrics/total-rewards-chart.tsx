"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from 'next-intl';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent
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
import { useEffect, useState } from "react";
import { fetchTotalRewardsMetrics } from "@/lib/metrics";

interface TotalRewardsChartProps {
  appId: string;
}

interface ChartData {
  name: string;
  value: number;
}

const TIME_RANGES = {
  "7d": { days: 7, label: "Last week" },
  "30d": { days: 30, label: "Last month" },
  "90d": { days: 90, label: "Last 3 months" },
} as const;

type TimeRange = keyof typeof TIME_RANGES;

export default function TotalRewardsChart({ appId }: TotalRewardsChartProps) {
  const t = useTranslations('metrics');
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [totalRewards, setTotalRewards] = useState(0);
  const [percentageChange, setPercentageChange] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const now = Math.floor(Date.now() / 1000); // Current time in seconds
        const endTime = (now * 1000000).toString(); // Convert to microseconds
        const startTime = ((now - (TIME_RANGES[timeRange].days * 24 * 60 * 60)) * 1000000).toString(); // Convert to microseconds
        
        const result = await fetchTotalRewardsMetrics(appId, startTime, endTime);
        if (result) {
          const formattedData = result.reduce((acc: { [key: string]: number }, item) => {
            const timestamp = Math.floor(parseInt(item.timestamp) / 1000000) * 1000;
            const date = new Date(timestamp);
            const dateKey = date.toLocaleDateString(undefined, { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            });
            
            // Aggregate counts by date
            acc[dateKey] = (acc[dateKey] || 0) + Number(item.count);
            return acc;
          }, {});

          // Convert aggregated data to array and sort by date
          const sortedData = Object.entries(formattedData)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => {
              const dateA = new Date(a.name);
              const dateB = new Date(b.name);
              return dateA.getTime() - dateB.getTime();
            });

          setData(sortedData);

          // Calculate total rewards and percentage change
          if (sortedData.length > 0) {
            // Calculate total rewards by summing all values in the time range
            const total = sortedData.reduce((sum, day) => sum + day.value, 0);
            setTotalRewards(total);
            
            // Calculate percentage change between first and last day
            if (sortedData.length > 1) {
              const firstDay = sortedData[0];
              const lastDay = sortedData[sortedData.length - 1];
              const change = ((lastDay.value - firstDay.value) / firstDay.value) * 100;
              setPercentageChange(change);
            } else {
              // If there's only one data point, set percentage change to 0
              setPercentageChange(0);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching total rewards data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [appId, timeRange]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Total Rewards</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-8 w-[130px]" />
          </div>
        </div>
        <div className="h-[200px]">
          <Skeleton className="w-full h-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Total Rewards</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{totalRewards}</span>
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
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 12 }}
              dy={10}
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
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Rewards
                          </span>
                          <span className="font-bold">
                            {payload[0].value}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="value" 
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
