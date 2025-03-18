"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { fetchRewardDistributionMetrics } from "@/lib/metrics";

interface RewardIdsListProps {
  appId: string;
}

interface RewardData {
  rewardId: string;
  totalCount: number;
}

export default function RewardIdsList({ appId }: RewardIdsListProps) {
  const t = useTranslations('metrics');
  const [data, setData] = useState<RewardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const result = await fetchRewardDistributionMetrics(appId);
        if (result) {
          const formattedData = Object.entries(result).map(([rewardId, stats]) => ({
            rewardId,
            totalCount: Number(stats[0]?.totalCount || 0)
          }));
          // Sort by total count in descending order
          formattedData.sort((a, b) => b.totalCount - a.totalCount);
          setData(formattedData);
        }
      } catch (error) {
        console.error('Error fetching reward IDs data:', error);
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
        <CardContent>
          <Skeleton className="w-full h-[300px]" />
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
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('rewardDistribution.rewardId')}</TableHead>
              <TableHead className="text-right">{t('rewardDistribution.count')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.rewardId}>
                <TableCell className="font-mono">{item.rewardId}</TableCell>
                <TableCell className="text-right">{item.totalCount.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 