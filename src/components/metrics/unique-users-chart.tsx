"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchUniqueUsersMetricsWrapped } from "@/lib/metrics";
import { format, subDays, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface UniqueUsersChartProps {
  appId: string;
  chainId: number;
}

const TIME_RANGES = {
  "7d": { days: 7 },
  "30d": { days: 30 },
  "90d": { days: 90 },
} as const;

type TimeRange = keyof typeof TIME_RANGES;

export default function UniqueUsersChart({ appId, chainId }: UniqueUsersChartProps) {
  const t = useTranslations("metrics.uniqueUsers");
  const [data, setData] = useState<any[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [percentageChange, setPercentageChange] = useState(0);
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const now = Date.now() * 1000;
    const startTime = (
      subDays(new Date(), TIME_RANGES[timeRange].days).getTime() * 1000
    ).toString();
    const endTime = now.toString();

    const fetchData = async () => {
      setIsLoading(true);
      const result = await fetchUniqueUsersMetricsWrapped(appId, chainId, startTime, endTime);
      if (result) {
        let formattedData: { [key: string]: { users: number; displayName: string } } = {};

        if (timeRange === "90d") {
          // Group data by weeks for 90-day view
          const weeks: { start: Date; end: Date }[] = [];
          const endDate = new Date();
          let currentDate = new Date(endDate.getTime() - (90 * 24 * 60 * 60 * 1000));
          
          while (currentDate <= endDate) {
            weeks.push({
              start: startOfWeek(currentDate),
              end: endOfWeek(currentDate)
            });
            currentDate = new Date(currentDate.getTime() + (7 * 24 * 60 * 60 * 1000));
          }

          // Initialize all weeks with zero values
          weeks.forEach(week => {
            const weekKey = `${format(week.start, 'MMM d, yyyy')} - ${format(week.end, 'MMM d, yyyy')}`;
            const displayKey = `${format(week.start, 'MMM d')} - ${format(week.end, 'MMM d')}`;
            formattedData[weekKey] = { users: 0, displayName: displayKey };
          });

          // Add actual values
          result.forEach(item => {
            const timestamp = parseInt(item.timestamp) / 1000000;
            const date = new Date(timestamp * 1000);
            
            const week = weeks.find(w => isWithinInterval(date, { start: w.start, end: w.end }));
            if (week) {
              const weekKey = `${format(week.start, 'MMM d, yyyy')} - ${format(week.end, 'MMM d, yyyy')}`;
              const displayKey = `${format(week.start, 'MMM d')} - ${format(week.end, 'MMM d')}`;
              formattedData[weekKey] = {
                users: (formattedData[weekKey]?.users || 0) + Number(item.count),
                displayName: displayKey
              };
            }
          });
        } else {
          const dates: Date[] = [];
          const endDate = new Date();
          let currentDate = new Date(endDate.getTime() - (TIME_RANGES[timeRange].days * 24 * 60 * 60 * 1000));
          
          while (currentDate <= endDate) {
            dates.push(new Date(currentDate));
            currentDate = new Date(currentDate.getTime() + (24 * 60 * 60 * 1000));
          }

          dates.forEach(date => {
            const dateKey = date.toLocaleDateString(undefined, { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            });
            const displayKey = date.toLocaleDateString(undefined, { 
              month: 'short', 
              day: 'numeric'
            });
            formattedData[dateKey] = { users: 0, displayName: displayKey };
          });

          result.forEach(item => {
            const timestamp = parseInt(item.timestamp) / 1000000;
            const date = new Date(timestamp * 1000); 
            const dateKey = date.toLocaleDateString(undefined, { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            });
            const displayKey = date.toLocaleDateString(undefined, { 
              month: 'short', 
              day: 'numeric'
            });
            
            formattedData[dateKey] = {
              users: (formattedData[dateKey]?.users || 0) + Number(item.count),
              displayName: displayKey
            };
          });
        }

        const sortedData = Object.entries(formattedData)
          .map(([name, data]) => ({ 
            name: data.displayName, 
            users: data.users,
            fullDate: name
          }))
          .sort((a, b) => {
            const getDate = (name: string) => {
              if (name.includes(' - ')) {
                const [startDate] = name.split(' - ');
                return new Date(startDate);
              }
              return new Date(name);
            };
            return getDate(a.fullDate).getTime() - getDate(b.fullDate).getTime();
          });

        setData(sortedData);

        if (result.length > 0) {
          const total = sortedData.reduce((acc, curr) => acc + curr.users, 0);
          setTotalUsers(total);
          
          if (sortedData.length > 1) {
            const nonZeroData = sortedData.filter(point => point.users > 0);
            
            if (nonZeroData.length >= 2) {
              if (timeRange === "7d") {
                // For 7-day view, use direct percentage change
                const firstValue = nonZeroData[0].users;
                const lastValue = nonZeroData[nonZeroData.length - 1].users;
                const percentageChange = ((lastValue - firstValue) / firstValue) * 100;
                setPercentageChange(isNaN(percentageChange) ? 0 : percentageChange);
              } else {
                // For 30 and 90 day views, use linear regression
                const n = nonZeroData.length;
                const sumX = (n - 1) * n / 2;
                const sumY = nonZeroData.reduce((acc, point) => acc + point.users, 0);
                const sumXY = nonZeroData.reduce((acc, point, i) => acc + (i * point.users), 0);
                const sumX2 = (n - 1) * n * (2 * n - 1) / 6;

                const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
                const firstValue = nonZeroData[0].users;
                const lastValue = firstValue + (slope * (n - 1));
                const percentageChange = ((lastValue - firstValue) / firstValue) * 100;
                
                setPercentageChange(isNaN(percentageChange) ? 0 : percentageChange);
              }
            } else {
              setPercentageChange(0);
            }
          } else {
            setPercentageChange(0);
          }
        } else {
          setTotalUsers(0);
          setPercentageChange(0);
        }
      }
      setIsLoading(false);
    };

    fetchData();
  }, [appId, chainId, timeRange]);

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">{t("title")}</h3>
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
        <div className="text-xs text-muted-foreground mt-2">
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">{t("title")}</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">0</span>
            </div>
            <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
              <SelectTrigger className="h-8 w-[130px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TIME_RANGES).map(([key]) => (
                  <SelectItem key={key} value={key}>
                    {t(`timeRanges.${key}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="h-[200px] flex items-center justify-center">
          <p className="text-muted-foreground">{t('noData')}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{t("description")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">{t("title")}</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{totalUsers}</span>
            {percentageChange !== 0 && (
              <span
                className={`text-sm px-2 py-1 rounded-full ${percentageChange > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
              >
                {percentageChange > 0 ? "+" : ""}
                {percentageChange.toFixed(0)}%
              </span>
            )}
          </div>
          <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
            <SelectTrigger className="h-8 w-[130px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TIME_RANGES).map(([key]) => (
                <SelectItem key={key} value={key}>
                  {t(`timeRanges.${key}`)}
                </SelectItem>
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
                <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748B", fontSize: 12 }}
              dy={10}
              interval={timeRange === "90d" ? 3 : timeRange === "30d" ? 6 : 1}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748B", fontSize: 12 }}
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
                            {payload[0].payload.name}
                          </span>
                          <span className="font-bold">
                            {payload[0].value} {t("users")}
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
              dot={{ fill: "#0EA5E9", r: 4 }}
              activeDot={{ r: 6, fill: "#0EA5E9" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-muted-foreground mt-2">{t("description")}</p>
    </div>
  );
}
