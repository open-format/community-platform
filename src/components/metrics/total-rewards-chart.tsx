"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from 'next-intl';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useEffect, useState } from "react";
import { fetchTotalRewardsMetricsWrapped } from "@/lib/metrics";
import { startOfWeek, endOfWeek, format, isWithinInterval } from 'date-fns';

interface TotalRewardsChartProps {
  appId: string;
}

interface ChartData {
  name: string;
  value: number;
}

const TIME_RANGES = {
  "7d": { days: 7, label: "Last 7 days" },
  "30d": { days: 30, label: "Last 30 days" },
  "90d": { days: 90, label: "Last 90 days" }
} as const;

type TimeRange = keyof typeof TIME_RANGES;

export default function TotalRewardsChart({ appId }: TotalRewardsChartProps) {
  const t = useTranslations('metrics.totalRewards');
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [totalRewards, setTotalRewards] = useState(0);
  const [percentageChange, setPercentageChange] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const now = Math.floor(Date.now() / 1000);
        const endTime = (now * 1000000).toString();
        const startTime = ((now - (TIME_RANGES[timeRange].days * 24 * 60 * 60)) * 1000000).toString();
        
        const result = await fetchTotalRewardsMetricsWrapped(appId, startTime, endTime);
        if (result) {
          let formattedData: { [key: string]: { value: number; displayName: string } } = {};

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
              formattedData[weekKey] = { value: 0, displayName: displayKey };
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
                  value: (formattedData[weekKey]?.value || 0) + Number(item.count),
                  displayName: displayKey
                };
              }
            });
          } else {
            // Create an array of all dates in the range
            const dates: Date[] = [];
            const endDate = new Date();
            let currentDate = new Date(endDate.getTime() - (TIME_RANGES[timeRange].days * 24 * 60 * 60 * 1000));
            
            while (currentDate <= endDate) {
              dates.push(new Date(currentDate));
              currentDate = new Date(currentDate.getTime() + (24 * 60 * 60 * 1000));
            }

            // Initialize all dates with zero values
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
              formattedData[dateKey] = { value: 0, displayName: displayKey };
            });

            // Add actual values
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
                value: (formattedData[dateKey]?.value || 0) + Number(item.count),
                displayName: displayKey
              };
            });
          }

          const sortedData = Object.entries(formattedData)
            .map(([name, data]) => ({ 
              name: data.displayName, 
              value: data.value,
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

          // Calculate total rewards and percentage change
          if (result.length > 0) {
            const total = sortedData.reduce((acc, curr) => acc + curr.value, 0);
            setTotalRewards(total);
            
            if (sortedData.length > 1) {
              const nonZeroData = sortedData.filter(point => point.value > 0);
              
              if (nonZeroData.length >= 2) {
                if (timeRange === "7d") {
                  // For 7-day view, use direct percentage change
                  const firstValue = nonZeroData[0].value;
                  const lastValue = nonZeroData[nonZeroData.length - 1].value;
                  const percentageChange = ((lastValue - firstValue) / firstValue) * 100;
                  setPercentageChange(isNaN(percentageChange) ? 0 : percentageChange);
                } else {
                  // For 30 and 90 day views, use linear regression
                  const n = nonZeroData.length;
                  const sumX = (n - 1) * n / 2;
                  const sumY = nonZeroData.reduce((acc, point) => acc + point.value, 0);
                  const sumXY = nonZeroData.reduce((acc, point, i) => acc + (i * point.value), 0);
                  const sumX2 = (n - 1) * n * (2 * n - 1) / 6;

                  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
                  const firstValue = nonZeroData[0].value;
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
            setTotalRewards(0);
            setPercentageChange(0);
          }
        } else {
          setData([]);
          setTotalRewards(0);
          setPercentageChange(0);
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
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">{t('title')}</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-8 w-12" />
            </div>
            <Skeleton className="h-8 w-[110px]" />
          </div>
        </div>
        <div className="h-[200px]">
          <Skeleton className="w-full h-full" />
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
          <h3 className="text-lg font-medium">{t('title')}</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">0</span>
            </div>
            <Select 
              value={timeRange} 
              onValueChange={(value: TimeRange) => setTimeRange(value)}
            >
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
        <p className="text-xs text-muted-foreground mt-2">
          {t('description')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">{t('title')}</h3>
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
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="name"
              tick={{ fontSize: 12 }}
              interval={timeRange === "90d" ? 3 : timeRange === "30d" ? 6 : 1} 
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip
              formatter={(value: number) => [value.toLocaleString(), t('rewards')]}
              labelFormatter={(label) => label}
            />
            <Bar 
              dataKey="value" 
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {t('description')}
      </p>
    </div>
  );
}
