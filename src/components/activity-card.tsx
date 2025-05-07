"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCurrentChain } from "@/hooks/useCurrentChain";
import { addressSplitter, desanitizeString, timeAgo } from "@/lib/utils";
import { CoinsIcon, ExternalLinkIcon, TrophyIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Skeleton } from "./ui/skeleton";

export default function ActivityCard({
  rewards,
}: {
  rewards: Reward[];
}) {
  const t = useTranslations("metrics.activity");
  const chain = useCurrentChain();
  const params = useParams();
  const chainName = params?.chainName as string;

  function getIcon(reward: Reward) {
    if (reward.badgeTokens.length > 0) {
      return <TrophyIcon className="h-4 w-4" />;
    }
    return <CoinsIcon className="h-4 w-4" />;
  }

  if (!rewards || rewards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground">{t("noActivity")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("rewardIdentifier")}</TableHead>
            <TableHead>{t("date")}</TableHead>
            <TableHead>{t("user")}</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rewards.map((reward) => (
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
                  <span className="font-medium">
                    {reward.user?.id ? addressSplitter(reward.user.id) : "-"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center h-8">
                  {chain?.BLOCK_EXPLORER_URL && reward.transactionHash && (
                    <Link
                      href={`${chain.BLOCK_EXPLORER_URL}/tx/${reward.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t("ariaLabels.viewTransaction")}
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
    </div>
  );
}

export function ActivityCardSkeleton() {
  const t = useTranslations("metrics.activity");
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("rewardIdentifier")}</TableHead>
            <TableHead>{t("date")}</TableHead>
            <TableHead>{t("user")}</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="w-full h-8" />
              </TableCell>
              <TableCell>
                <Skeleton className="w-full h-8" />
              </TableCell>
              <TableCell>
                <Skeleton className="w-full h-8" />
              </TableCell>
              <TableCell>
                <Skeleton className="w-full h-8" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
