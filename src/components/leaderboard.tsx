"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { generateLeaderboard } from "@/lib/openformat";
import { cn } from "@/lib/utils";
import { usePrivy } from "@privy-io/react-auth";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";
import Discord from "../../public/icons/discord.svg";
import Github from "../../public/icons/github.svg";
import Telegram from "../../public/icons/telegram.svg";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";

interface LeaderboardProps {
  data: LeaderboardEntry[] | null;
  isLoading?: boolean;
  showSocialHandles?: boolean;
  metadata?: {
    user_label: string;
    token_label: string;
    token_to_display?: string;
  };
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
  selectedToken?: {
    token: {
      id: string;
      name: string;
      symbol: string;
    };
  };
}) {
  const t = useTranslations("overview.leaderboard");

  return (
    <TableRow>
      <TableHead>{t("rank")}</TableHead>
      <TableHead>{metadata?.user_label ?? t("user")}</TableHead>
      <TableHead className="text-right capitalize whitespace-nowrap">
        {selectedToken?.token ? `${selectedToken.token.name} (${selectedToken.token.symbol})` : t("points")}
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
                      : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400"
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
          <LeaderboardHeader metadata={metadata} />
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

export default function Leaderboard({
  data,
  metadata,
  isLoading: initialLoading = false,
  showSocialHandles = false,
  tokens,
  slug,
}: LeaderboardProps) {
  const { user } = usePrivy();
  const t = useTranslations("overview.leaderboard");
  const [localData, setLocalData] = useState<LeaderboardEntry[] | null>(data);
  const [isLoading, setIsLoading] = useState(initialLoading);

  const [selectedTokenId, setSelectedTokenId] = useState<string>(
    metadata?.token_to_display || tokens?.[0]?.token.id || ""
  );

  useEffect(() => {
    if (tokens?.length > 0) {
      const defaultTokenId = metadata?.token_to_display || tokens[0].token.id;
      handleTokenSelect(defaultTokenId);
      setSelectedTokenId(defaultTokenId);
    }
  }, [tokens]);

  const handleTokenSelect = async (tokenId: string) => {
    setIsLoading(true);
    try {
      const newData = await generateLeaderboard(slug, tokenId);
      setLocalData(newData);
      setSelectedTokenId(tokenId);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedToken = tokens?.find((t) => t.token.id === selectedTokenId);

  const content = isLoading ? (
    <LeaderboardSkeleton />
  ) : !localData || localData.length === 0 || localData?.error ? (
    <EmptyState metadata={metadata} />
  ) : (
    <Table className="w-full">
      <TableHeader>
        <LeaderboardHeader metadata={metadata} selectedToken={selectedToken} />
      </TableHeader>
      <TableBody>
        {localData
          ?.filter((e) => e.xp_rewarded > "0.001")
          ?.map((entry, index) => {
            const position = index + 1;
            const isCurrentUser =
              user?.wallet?.address && entry.user.toLowerCase() === user?.wallet?.address.toLowerCase();
            const SocialIcon =
              showSocialHandles &&
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
                        : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400"
                    )}
                  >
                    {position}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{showSocialHandles ? entry.handle : entry.user}</span>
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
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-2">
            <Label>{t("token")}</Label>
            <Select value={selectedTokenId} onValueChange={handleTokenSelect}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("selectToken")} />
              </SelectTrigger>
              <SelectContent>
                {tokens?.map((i) => (
                  <SelectItem key={i.token.id} value={i.token.id}>
                    {i.token.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
