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
          const formattedData = result.map(item => {
            // Convert microseconds to milliseconds and adjust for timezone
            const timestamp = Math.floor(parseInt(item.timestamp) / 1000000) * 1000;
            const date = new Date(timestamp);
            // Format date in local timezone
            return {
              name: date.toLocaleDateString(undefined, { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              }),
              value: Number(item.count)
            };
          });
          setData(formattedData);

          // Calculate total rewards and percentage change
          if (formattedData.length > 0) {
            const latest = formattedData[formattedData.length - 1];
            setTotalRewards(latest.value);
            
            // Calculate percentage change
            if (formattedData.length > 1) {
              const previous = formattedData[formattedData.length - 2];
              const change = ((latest.value - previous.value) / previous.value) * 100;
              setPercentageChange(change);
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
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">Total Rewards</h3>
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-8 w-[130px]" />
        </div>
        <div className="h-[200px]">
          <Skeleton className="w-full h-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Total Rewards</h3>
          <span className="text-2xl font-bold">{totalRewards}</span>
          {percentageChange !== 0 && (
            <span className={`text-sm ${percentageChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
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

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="totalRewards" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
              </linearGradient>
            </defs>
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
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Rewards
                          </span>
                          <span className="font-bold text-muted-foreground">
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
              fill="url(#totalRewards)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
