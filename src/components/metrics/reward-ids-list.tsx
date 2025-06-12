"use client";

import { Card, CardContent } from "@/components/ui/card";
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
import { desanitizeString } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

interface RewardIdStats {
  timestamp: string;
  totalCount: string;
}

interface RewardData {
  rewardId: string;
  totalCount: number;
}

interface RewardIdsListProps {
  appId: string;
  chainId: number;
  data: Record<string, RewardIdStats[]> | null;
}

const ITEMS_PER_PAGE = 5;

export default function RewardIdsList({ appId, chainId, data }: RewardIdsListProps) {
  const t = useTranslations('metrics.rewards');
  const [formattedData, setFormattedData] = useState<RewardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    if (data) {
      const formatted = Object.entries(data)
        .map(([rewardId, stats]) => ({
          rewardId,
          totalCount: Number(stats[0]?.totalCount || 0)
        }))
        .sort((a, b) => b.totalCount - a.totalCount);
      setFormattedData(formatted);
      setTotalItems(formatted.length);
    }
    setIsLoading(false);
  }, [data]);

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = formattedData.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('rank')}</TableHead>
                <TableHead>{t('rewardId')}</TableHead>
                <TableHead>{t('totalCount')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(ITEMS_PER_PAGE)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-2 h-8">
                      <Skeleton className="h-4 w-8" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 h-8">
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 h-8">
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center space-x-2 justify-center mt-4">
            <Button
              variant="outline"
              disabled
              className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-secondary"
            >
              Previous
            </Button>
            <div className={buttonVariants({ variant: "outline" })}>1</div>
            <Button
              variant="outline"
              disabled
              className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-secondary"
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!formattedData.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center h-[200px]">
            <p className="text-muted-foreground">{t('noData')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('rank')}</TableHead>
              <TableHead>{t('rewardId')}</TableHead>
              <TableHead>{t('totalCount')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((reward, index) => (
              <TableRow key={reward.rewardId}>
                <TableCell>
                  <div className="flex items-center gap-2 h-8">
                    <span className="font-medium">{startIndex + index + 1}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 h-8">
                    <span className="font-medium">{desanitizeString(reward.rewardId)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 h-8">
                    <span className="font-medium">{reward.totalCount}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <div className="flex items-center space-x-2 justify-center mt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-secondary"
            >
              Previous
            </Button>
            <div className={buttonVariants({ variant: "outline" })}>{currentPage}</div>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-secondary"
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 