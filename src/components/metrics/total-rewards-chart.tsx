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
  AreaChart,
  Area
} from 'recharts';
import { useEffect, useState } from "react";
import { fetchTotalRewardsMetrics } from "@/lib/metrics";
import { startOfWeek, endOfWeek, format, isWithinInterval } from 'date-fns';

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
        
        const result = await fetchTotalRewardsMetrics(appId, startTime, endTime);
        if (result) {
          let formattedData: { [key: string]: number } = {};

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

            result.forEach(item => {
              const timestamp = parseInt(item.timestamp) / 1000000;
              const date = new Date(timestamp * 1000);
              
              // Find which week this data point belongs to
              const week = weeks.find(w => isWithinInterval(date, { start: w.start, end: w.end }));
              if (week) {
                const weekKey = `${format(week.start, 'MMM d')} - ${format(week.end, 'MMM d')}`;
                formattedData[weekKey] = (formattedData[weekKey] || 0) + Number(item.count);
              }
            });
          } else {
            // Original daily grouping for 7d and 30d views
            formattedData = result.reduce((acc: { [key: string]: number }, item) => {
              const timestamp = parseInt(item.timestamp) / 1000000;
              const date = new Date(timestamp * 1000); 
              const dateKey = date.toLocaleDateString(undefined, { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              });
              
              acc[dateKey] = (acc[dateKey] || 0) + Number(item.count);
              return acc;
            }, {});
          }

          // Convert aggregated data to array and sort by date
          const sortedData = Object.entries(formattedData)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => {
              const dateA = new Date(a.name.split(' - ')[0]);
              const dateB = new Date(b.name.split(' - ')[0]);
              return dateA.getTime() - dateB.getTime();
            });

          setData(sortedData);

          // Calculate total rewards and percentage change
          if (result.length > 0) {
            const total = result.reduce((acc, curr) => acc + Number(curr.count), 0);
            setTotalRewards(total);
            
            if (sortedData.length > 1) {
              const firstPoint = sortedData[0];
              const lastPoint = sortedData[sortedData.length - 1];
              const change = ((lastPoint.value - firstPoint.value) / firstPoint.value) * 100;
              setPercentageChange(change);
            } else {
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
