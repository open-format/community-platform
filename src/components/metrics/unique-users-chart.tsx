"use client";

import { fetchUniqueUsersMetrics } from "@/lib/metrics";
import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, subDays } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

  useEffect(() => {
    const now = Date.now() * 1000; // Convert to microseconds
    const startTime = (subDays(new Date(), TIME_RANGES[timeRange].days).getTime() * 1000).toString();
    const endTime = now.toString();

    const fetchData = async () => {
      const metrics = await fetchUniqueUsersMetrics(appId, startTime, endTime);
      if (metrics) {
        const formattedData = metrics.map(metric => ({
          date: format(new Date(parseInt(metric.timestamp) / 1000000), "EEE"),
          users: metric.count || 0
        }));
        setData(formattedData);

        // Calculate total users and percentage change
        if (metrics.length > 0) {
          const latest = metrics[metrics.length - 1];
          setTotalUsers(latest.totalCount);
          
          // Calculate percentage change
          if (metrics.length > 1) {
            const previous = metrics[metrics.length - 2];
            const change = ((latest.totalCount - previous.totalCount) / previous.totalCount) * 100;
            setPercentageChange(change);
          }
        }
      }
    };

    fetchData();
  }, [appId, timeRange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Unique Users</h3>
          <span className="text-2xl font-bold">{totalUsers}</span>
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
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="uniqueUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
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
                            Users
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