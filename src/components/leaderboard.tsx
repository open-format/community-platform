"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Minus, Star, Trophy } from "lucide-react";

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  position: number;
  currentWallet?: string;
}

const LeaderboardRow = ({ entry, position, currentWallet }: LeaderboardRowProps) => {
  const isCurrentUser = currentWallet && entry.user.toLowerCase() === currentWallet.toLowerCase();

  const renderPositionChange = () => {
    const changes = {
      first: position === 1 && <Trophy className="h-4 w-4" />,
      new: entry.positionChange === "new" && <Star className="h-4 w-4" />,
      unchanged: (!entry.positionChange || entry.positionChange === 0) && <Minus className="h-4 w-4" />,
      up: entry.positionChange && entry.positionChange > 0 && (
        <>
          <ArrowUp className="h-4 w-4" />
          {entry.positionChange}
        </>
      ),
      down: entry.positionChange && entry.positionChange < 0 && (
        <>
          <ArrowDown className="h-4 w-4" />
          {Math.abs(entry.positionChange)}
        </>
      ),
    };

    const change = Object.entries(changes).find(([_, value]) => value)?.[0] || "unchanged";
    const colorMap = {
      first: "text-yellow-500",
      new: "text-blue-500",
      unchanged: "text-gray-500",
      up: "text-green-500",
      down: "text-red-500",
    };

    return (
      <span className={`flex items-center justify-end ${colorMap[change as keyof typeof colorMap]} text-sm w-16`}>
        {changes[change as keyof typeof changes]}
      </span>
    );
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between py-4 px-4 rounded-lg transition-colors",
        isCurrentUser ? "bg-purple-100 dark:bg-purple-900/50" : "hover:bg-zinc-100/80 dark:hover:bg-zinc-900/30"
      )}
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
          <span className="font-medium truncate">{entry.user}</span>
          {isCurrentUser && (
            <span className="text-xs px-2 py-1 bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-300 rounded-full whitespace-nowrap">
              You
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="font-semibold w-40 text-right">{entry.xp_rewarded} Points</div>
        {renderPositionChange()}
      </div>
    </div>
  );
};

interface LeaderboardProps {
  data: LeaderboardEntry[];
  currentWallet?: string;
  isLoading?: boolean;
}

export default function Leaderboard({ data, currentWallet, isLoading = false }: LeaderboardProps) {
  if (isLoading) {
    return (
      <Card>
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
    <Card>
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">Dan&apos;s Leaderboard</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {data.length} {data.length === 1 ? "Participant" : "Participants"}
            </p>
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
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
