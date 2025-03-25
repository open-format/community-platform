"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentChain } from "@/hooks/useCurrentChain";
import { addressSplitter, desanitizeString, timeAgo } from "@/lib/utils";
import { CoinsIcon, ExternalLinkIcon, TrophyIcon } from "lucide-react";
import { useTranslations } from 'next-intl';
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const ITEMS_PER_PAGE = 5;

export default function Activity({
  rewards,
  showUserAddress = false,
  isLoading = false,
}: {
  rewards: Reward[];
  title?: string;
  showUserAddress?: boolean;
  isLoading?: boolean;
}) {
  const t = useTranslations('metrics.activity');
  const chain = useCurrentChain();
  const [currentPage, setCurrentPage] = useState(1);

  function getIcon(reward: Reward) {
    if (reward.badgeTokens.length > 0) {
      return <TrophyIcon className="h-4 w-4" />;
    }
    return <CoinsIcon className="h-4 w-4" />;
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('rewardIdentifier')}</TableHead>
              <TableHead>{t('date')}</TableHead>
              <TableHead>{t('user')}</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center gap-2 h-8">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 h-8">
                    <Skeleton className="h-4 w-24" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 h-8">
                    <Skeleton className="h-4 w-32" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center h-8">
                    <Skeleton className="h-4 w-4" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (!rewards || rewards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground">{t('noActivity')}</p>
      </div>
    );
  }

  const totalPages = Math.ceil(rewards.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayRewards = rewards.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('rewardIdentifier')}</TableHead>
            <TableHead>{t('date')}</TableHead>
            <TableHead>{t('user')}</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayRewards.map((reward) => (
            <TableRow key={reward.id}>
              <TableCell>
                <div className="flex items-center gap-2 h-8">
                  {getIcon(reward)}
                  <span className="font-medium">{desanitizeString(reward.rewardId)}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 h-8">
                  <span className="font-medium">{timeAgo(Number(reward.createdAt))}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 h-8">
                  <span className="font-medium">{reward.user?.id ? addressSplitter(reward.user.id) : '-'}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center h-8">
                  {chain?.BLOCK_EXPLORER_URL && reward.transactionHash && (
                    <Link
                      href={`${chain.BLOCK_EXPLORER_URL}/tx/${reward.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t('ariaLabels.viewTransaction')}
                    >
                      <ExternalLinkIcon className="h-4 w-4" />
                    </Link>
                  )}
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
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  aria-disabled={currentPage === 1}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i + 1}>
                  <PaginationLink
                    onClick={() => setCurrentPage(i + 1)}
                    isActive={currentPage === i + 1}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  aria-disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
