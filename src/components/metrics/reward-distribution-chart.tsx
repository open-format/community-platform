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
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            {t('rewardDistribution.title')}
            <Skeleton className="h-10 w-[120px]" />
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <Skeleton className="w-full h-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('rewardDistribution.title')}</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">{t('rewardDistribution.noData')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('rewardDistribution.title')}</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ChartContainer
          config={{
            distribution: {
              label: t('rewardDistribution.title'),
              theme: {
                light: "hsl(var(--primary))",
                dark: "hsl(var(--primary))",
              },
            },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
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
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              {t('rewardDistribution.rewardId')}
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {payload[0]?.name}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              {t('rewardDistribution.count')}
                            </span>
                            <span className="font-bold">
                              {payload[0]?.value?.toLocaleString()}
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
        </ChartContainer>
      </CardContent>
    </Card>
  );
} 