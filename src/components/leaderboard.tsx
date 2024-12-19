"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { addressSplitter, cn, getContrastSafeColor } from "@/lib/utils";
import { Badge } from "./ui/badge";

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  position: number;
  currentWallet?: string;
  theme: Theme;
}

const LeaderboardRow = ({ entry, position, currentWallet, theme }: LeaderboardRowProps) => {
  const isCurrentUser = currentWallet && entry.user.toLowerCase() === currentWallet.toLowerCase();

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
          <span className="truncate">{addressSplitter(entry.user)}</span>
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
}

export default function Leaderboard({ theme, data, currentWallet, isLoading = false }: LeaderboardProps) {
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
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
