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
import { MoreHorizontal } from "lucide-react";
import { desanitizeString } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

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
  const [showAll, setShowAll] = useState(false);
  const DEFAULT_DISPLAY_COUNT = 7;

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

  const displayData = showAll ? data : data.slice(0, DEFAULT_DISPLAY_COUNT);
  const hasMore = data.length > DEFAULT_DISPLAY_COUNT;

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
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Reward ID</TableHead>
            <TableHead>Reward Identifier</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayData.map((reward, index) => (
            <TableRow key={reward.rewardId}>
              <TableCell>
                <div className="flex items-center gap-2 h-8">
                  <span className="font-medium">{index + 1}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 h-8">
                  <span className="font-medium">{desanitizeString(reward.rewardId)}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2 h-8">
                  <span className="font-medium">{reward.totalCount}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center h-8">
                  <button className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {hasMore && (
        <Button
          variant="ghost"
          className="w-full text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? (
            <>
              Show less <ChevronUp className="h-4 w-4 ml-2" />
            </>
          ) : (
            <>
              Show more <ChevronDown className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      )}
    </div>
  );
} 