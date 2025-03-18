"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from 'next-intl';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";
import { 
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { useEffect, useState } from "react";
import { fetchRewardDistributionMetrics } from "@/lib/metrics";

interface RewardDistributionChartProps {
  appId: string;
}

interface ChartData {
  name: string;
  value: number;
}

const COLORS = [
  'hsl(222.2, 47.4%, 11.2%)', // primary
  'hsl(217.2, 32.6%, 17.5%)', // secondary
  'hsl(215, 20.2%, 65.1%)',   // accent
  'hsl(0, 84.2%, 60.2%)',     // destructive
  'hsl(215, 16.3%, 46.9%)',   // muted
  'hsl(222.2, 47.4%, 11.2%)', // popover
  'hsl(0, 0%, 100%)',         // card
  'hsl(214.3, 31.8%, 91.4%)', // border
  'hsl(214.3, 31.8%, 91.4%)', // input
  'hsl(222.2, 47.4%, 11.2%)', // ring
];

// Generate a color based on index
function getColor(index: number): string {
  if (index < COLORS.length) {
    return COLORS[index];
  }

  const goldenRatio = 0.618033988749895;
  const hue = (index * goldenRatio * 360) % 360;
  
  return `hsl(${hue}, 70%, 60%)`;
}

export default function RewardDistributionChart({ appId }: RewardDistributionChartProps) {
  const t = useTranslations('metrics');
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalRewards, setTotalRewards] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const result = await fetchRewardDistributionMetrics(appId);
        if (result) {
          const formattedData = Object.entries(result).map(([rewardId, stats]) => ({
            name: rewardId,
            value: Number(stats[0]?.totalCount || 0)
          }));
          setData(formattedData);
          // Calculate total rewards
          const total = formattedData.reduce((acc, curr) => acc + curr.value, 0);
          setTotalRewards(total);
        }
      } catch (error) {
        console.error('Error fetching reward distribution data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [appId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Reward Distribution</h3>
          <Skeleton className="h-8 w-16" />
        </div>
        <div className="h-[200px]">
          <Skeleton className="w-full h-full" />
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Reward Distribution</h3>
        </div>
        <div className="h-[200px] flex items-center justify-center">
          <p className="text-muted-foreground">{t('rewardDistribution.noData')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Reward Distribution</h3>
      </div>

      <div className="h-[200px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={2}
              dataKey="value"
              stroke="hsl(var(--background))"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getColor(index)}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const value = Number(payload[0]?.value || 0);
                  const percent = ((value / totalRewards) * 100).toFixed(0);
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            {payload[0]?.name}
                          </span>
                          <span className="font-bold">
                            {value.toLocaleString()} ({percent}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold">{totalRewards.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground">Rewards</span>
        </div>
      </div>
    </div>
  );
} 