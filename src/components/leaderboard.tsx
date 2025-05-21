"use client";

import DatePickerWithPresets from "@/components/date-picker";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { cn, filterVisibleTokens } from "@/lib/utils";
import { usePrivy } from "@privy-io/react-auth";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import Discord from "../../public/icons/discord.svg";
import Github from "../../public/icons/github.svg";
import Telegram from "../../public/icons/telegram.svg";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";

interface LeaderboardProps {
  data: LeaderboardEntry[] | null;
  isLoading?: boolean;
  showSocialHandles?: boolean;
  community: Community;
  tokens: {
    token: {
      id: string;
      name: string;
      symbol: string;
    };
  }[];
  onTokenSelect?: (tokenId: string) => void;
  slug: string;
}

function LeaderboardHeader({
  metadata,
  selectedToken,
}: {
  metadata: any;
  selectedToken: { token: { id: string; name: string; symbol: string } };
}) {
  const t = useTranslations("overview.leaderboard");

  return (
    <TableRow>
      <TableHead>{t("rank")}</TableHead>
      <TableHead>{metadata.user_label ?? t("user")}</TableHead>
      <TableHead className="text-right capitalize whitespace-nowrap">
        {selectedToken?.token
          ? `${selectedToken.token.name} (${selectedToken.token.symbol})`
          : t("points")}
      </TableHead>
    </TableRow>
  );
}

const LeaderboardSkeleton = () => {
  const t = useTranslations("overview.leaderboard");

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("rank")}</TableHead>
          <TableHead>
            <Skeleton className="h-4 w-20" />
          </TableHead>
          <TableHead className="text-right">
            <Skeleton className="h-4 w-16 ml-auto" />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array(5)
          .fill(null)
          .map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <div
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold",
                    index === 0
                      ? "bg-yellow-500 text-white"
                      : index === 1
                        ? "bg-gray-300 text-gray-800"
                        : index === 2
                          ? "bg-amber-600 text-white"
                          : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400",
                  )}
                >
                  {index + 1}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-40" />
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-4 w-20 ml-auto" />
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
};

const EmptyState = ({ metadata }: Pick<LeaderboardProps, "metadata">) => {
  const t = useTranslations("overview.leaderboard");
  return (
    <Card variant="borderless" className="h-full">
      <CardContent>
        <Table>
          <TableHeader>
            <LeaderboardHeader metadata={metadata} />
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                {t("noData")}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default function Leaderboard({ community }: LeaderboardProps) {
  const { user } = usePrivy();
  const t = useTranslations("overview.leaderboard");

  // State for token and date
  const visibleTokens = filterVisibleTokens(
    community?.onchainData?.tokens,
    community?.hiddenTokens,
  );
  const [selectedTokenId, setSelectedTokenId] = useState(
    community.tokenToDisplay || visibleTokens?.[0]?.token.id || "",
  );
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date(),
  });

  // Convert date to unix string for the hook
  const startDate = date?.from ? dayjs(date.from).unix().toString() : "";
  const endDate = date?.to ? dayjs(date.to).unix().toString() : "";

  const { data: leaderboardData, isLoading } = useLeaderboard(
    community,
    selectedTokenId,
    startDate,
    endDate,
  );

  const selectedToken = community?.onchainData?.tokens?.find((t) => t.token.id === selectedTokenId);

  const content = isLoading ? (
    <LeaderboardSkeleton />
  ) : !leaderboardData || leaderboardData.length === 0 ? (
    <EmptyState metadata={community} />
  ) : (
    <Table className="w-full">
      <TableHeader>
        <LeaderboardHeader metadata={community} selectedToken={selectedToken} />
      </TableHeader>
      <TableBody>
        {leaderboardData
          ?.filter((e) => e.xp_rewarded > "0.001")
          ?.map((entry, index) => {
            const position = index + 1;
            const isCurrentUser =
              user?.wallet?.address &&
              entry.user.toLowerCase() === user?.wallet?.address.toLowerCase();
            const SocialIcon =
              community?.showSocialHandles &&
              (entry.type === "discord"
                ? Discord
                : entry.type === "telegram"
                  ? Telegram
                  : entry.type === "github"
                    ? Github
                    : null);

            return (
              <TableRow key={entry.user}>
                <TableCell>
                  <div
                    className={cn(
                      "w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold",
                      position === 1
                        ? "bg-yellow-500 text-white"
                        : position === 2
                          ? "bg-gray-300 text-gray-800"
                          : position === 3
                            ? "bg-amber-600 text-white"
                            : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400",
                    )}
                  >
                    {position}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">
                      {community?.showSocialHandles ? entry.handle : entry.user}
                    </span>
                    {SocialIcon && (
                      <div className="bg-white rounded-full p-1">
                        <Image src={SocialIcon} alt={entry.type} width={16} height={16} />
                      </div>
                    )}
                    {isCurrentUser && <Badge>You</Badge>}
                  </div>
                </TableCell>
                <TableCell className="text-right font-semibold">{entry.xp_rewarded}</TableCell>
              </TableRow>
            );
          })}
      </TableBody>
    </Table>
  );

  return (
    <Card variant="borderless" className="h-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 sm:mb-0 space-y-6 sm:space-y-0">
          <div className="space-y-2">
            <Label>{t("token")}</Label>
            <Select value={selectedTokenId} onValueChange={setSelectedTokenId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("selectToken")} />
              </SelectTrigger>
              <SelectContent>
                {visibleTokens?.map((i) => (
                  <SelectItem key={i.token.id} value={i.token.id}>
                    {i.token.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col space-y-4">
            <Label>{t("datePicker.filterByDate")}</Label>
            <DatePickerWithPresets onDateChange={setDate} />
          </div>
        </div>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
