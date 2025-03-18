"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export default function Activity({
  rewards,
  showUserAddress = false,
}: {
  rewards: Reward[];
  title?: string;
  showUserAddress?: boolean;
}) {
  const t = useTranslations('activity');
  const chain = useCurrentChain();
  const [showAll, setShowAll] = useState(false);
  const DEFAULT_DISPLAY_COUNT = 7;

  function getIcon(reward: Reward) {
    if (reward.badgeTokens.length > 0) {
      return <TrophyIcon className="h-4 w-4" />;
    }
    return <CoinsIcon className="h-4 w-4" />;
  }

  if (!rewards || rewards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground">{t('noActivity')}</p>
      </div>
    );
  }

  const displayRewards = showAll ? rewards : rewards.slice(0, DEFAULT_DISPLAY_COUNT);
  const hasMore = rewards.length > DEFAULT_DISPLAY_COUNT;

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reward Identifier</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>User</TableHead>
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
