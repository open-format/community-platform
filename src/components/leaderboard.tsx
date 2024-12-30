"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { addressSplitter, cn, getContrastSafeColor } from "@/lib/utils";
import Image from "next/image";
import Discord from "../../public/icons/discord.svg";
import Telegram from "../../public/icons/telegram.svg";
import { Badge } from "./ui/badge";

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  position: number;
  currentWallet?: string;
  theme: Theme;
  showSocialHandles?: boolean;
}

const LeaderboardRow = ({ entry, position, currentWallet, theme, showSocialHandles }: LeaderboardRowProps) => {
  const isCurrentUser = currentWallet && entry.user.toLowerCase() === currentWallet.toLowerCase();

  const SocialIcon =
    showSocialHandles && (entry.type === "discord" ? Discord : entry.type === "telegram" ? Telegram : null);

  return (
    <div
      className={cn("flex items-center justify-between py-4 px-4 rounded-lg transition-colors")}
      style={
        isCurrentUser ? { backgroundColor: theme.borderColor, color: getContrastSafeColor(theme.borderColor) } : {}
      }
    >
      <div className="flex items-center gap-4 flex-1">
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
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="truncate">{showSocialHandles ? entry.handle : addressSplitter(entry.user)}</span>
          {SocialIcon && (
            <div className="bg-white rounded-full p-1">
              <Image src={SocialIcon} alt={entry.type} width={16} height={16} />
            </div>
          )}
          {isCurrentUser && (
            <Badge
              style={{
                backgroundColor: theme.buttonColor,
                color: getContrastSafeColor(theme.buttonColor),
              }}
            >
              You
            </Badge>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="font-semibold text-right">{entry.xp_rewarded} Points</div>
      </div>
    </div>
  );
};

interface LeaderboardProps {
  theme: {
    backgroundColor: string;
    color: string;
    borderColor: string;
  };
  data: LeaderboardEntry[];
  currentWallet?: string;
  isLoading?: boolean;
  showSocialHandles?: boolean;
}

export default function Leaderboard({
  theme,
  data,
  currentWallet,
  isLoading = false,
  showSocialHandles = false,
}: LeaderboardProps) {
  if (isLoading) {
    return (
      <Card style={theme} className="h-full">
        <CardHeader className="space-y-1 pb-4">
          <Skeleton className="h-8 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data?.length) {
    return (
      <Card variant="borderless" style={theme} className="h-full">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl font-bold tracking-tight">Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">No entries yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="borderless" style={theme} className="h-full">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">Leaderboard</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.map((entry) => (
            <LeaderboardRow
              key={entry.user}
              entry={entry}
              position={data.findIndex((e) => e.user === entry.user) + 1}
              currentWallet={currentWallet}
              theme={theme}
              showSocialHandles={showSocialHandles}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
