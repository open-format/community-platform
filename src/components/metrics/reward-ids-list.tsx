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
import { fetchRewardDistributionMetrics } from "@/lib/metrics";
import { desanitizeString } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface RewardIdsListProps {
  appId: string;
}

interface RewardData {
  rewardId: string;
  totalCount: number;
}

const ITEMS_PER_PAGE = 5;

export default function RewardIdsList({ appId }: RewardIdsListProps) {
  const t = useTranslations('metrics.rewards');
  const [data, setData] = useState<RewardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const result = await fetchRewardDistributionMetrics(appId);
        if (result) {
          const formattedData = Object.entries(result)
            .map(([rewardId, stats]) => ({
              rewardId,
              totalCount: Number(stats[0]?.totalCount || 0)
            }))
            .sort((a, b) => b.totalCount - a.totalCount);
          setData(formattedData);
          setTotalItems(formattedData.length);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [appId]);

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = data.slice(startIndex, endIndex);

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
        </CardContent>
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
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
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                {currentPage > 2 && (
                  <>
                    <PaginationItem>
                      <PaginationLink onClick={() => setCurrentPage(1)}>1</PaginationLink>
                    </PaginationItem>
                    {currentPage > 3 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                  </>
                )}
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationLink onClick={() => setCurrentPage(prev => prev - 1)}>
                      {currentPage - 1}
                    </PaginationLink>
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationLink isActive>{currentPage}</PaginationLink>
                </PaginationItem>
                {currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationLink onClick={() => setCurrentPage(prev => prev + 1)}>
                      {currentPage + 1}
                    </PaginationLink>
                  </PaginationItem>
                )}
                {currentPage < totalPages - 1 && (
                  <>
                    {currentPage < totalPages - 2 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 