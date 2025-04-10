"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from 'next-intl';
import { 
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { useEffect, useState } from "react";
import { fetchRewardDistributionMetrics } from "@/lib/metrics";
import { desanitizeString } from "@/lib/utils";

interface RewardDistributionChartProps {
  appId: string;
  data: Record<string, RewardIdStats[]> | null;
}

interface ChartData {
  name: string;
  value: number;
}

interface RewardIdStats {
  timestamp: string;
  totalCount: string;
}

const COLORS = [
  'hsl(222.2, 47.4%, 11.2%)', // primary - dark blue
  'hsl(0, 84.2%, 60.2%)',     // destructive - red
  'hsl(142.1, 76.2%, 36.3%)', // success - green
  'hsl(215, 20.2%, 65.1%)',   // accent - blue
  'hsl(262.1, 83.3%, 57.8%)', // purple
  'hsl(45, 93%, 47.1%)',      // yellow
  'hsl(346.8, 77.2%, 49.8%)', // pink
  'hsl(199, 89%, 48.4%)',     // cyan
  'hsl(24, 95%, 53.1%)',      // orange
];

// Generate a color based on index
function getColor(index: number): string {
  if (index < COLORS.length) {
    return COLORS[index];
  }

  const goldenRatio = 0.618033988749895;
  const hue = (index * goldenRatio * 360) % 360;
  
  return `hsl(${hue}, 85%, 55%)`;
}

export default function RewardDistributionChart({ appId, data }: RewardDistributionChartProps) {
  const t = useTranslations('metrics.rewardDistribution');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalRewards, setTotalRewards] = useState(0);

  useEffect(() => {
    if (data) {
      const formatted = Object.entries(data)
        .map(([rewardId, stats]) => ({
          name: desanitizeString(rewardId),
          value: Number(stats[0]?.totalCount || 0)
        }))
        .sort((a, b) => b.value - a.value);
      setChartData(formatted);
      const total = formatted.reduce((acc, curr) => acc + curr.value, 0);
      setTotalRewards(total);
    } else {
      setChartData([]);
      setTotalRewards(0);
    }
    setIsLoading(false);
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">{t('title')}</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </div>
        <div className="h-[200px] relative">
          <Skeleton className="w-full h-full rounded-lg" />
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">{t('title')}</h3>
        </div>
        <div className="h-[200px] relative flex items-center justify-center">
          <p className="text-muted-foreground">{t('noData')}</p>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {t('description')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">{t('title')}</h3>
      </div>

      <div className="h-[200px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
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
              {chartData.map((entry, index) => (
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
                    <div className="rounded-lg border bg-background p-2 shadow-sm" style={{ zIndex: 9999 }}>
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
              wrapperStyle={{ zIndex: 9999 }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ zIndex: 1 }}>
          <span className="text-2xl font-bold">{totalRewards.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground">{t('rewards')}</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {t('description')}
      </p>
    </div>
  );
} 