"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Discord from "../../public/icons/discord.svg";
import Telegram from "../../public/icons/telegram.svg";
import { Badge } from "./ui/badge";

interface LeaderboardProps {
  data: LeaderboardEntry[];
  currentWallet?: string;
  isLoading?: boolean;
  showSocialHandles?: boolean;
  metadata?: {
    user_label: string;
    token_label: string;
  };
}

export default function Leaderboard({
  data,
  metadata,
  currentWallet,
  isLoading = false,
  showSocialHandles = false,
}: LeaderboardProps) {
  if (isLoading) {
    return (
      <Card className="h-full">
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

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground">No leaderboard data yet</p>
      </div>
    );
  }

  return (
    <Card variant="borderless" className="h-full">
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>{metadata?.user_label ?? "User"}</TableHead>
              <TableHead className="text-right">{metadata?.token_label ?? "Points"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((entry, index) => {
              const position = index + 1;
              const isCurrentUser = currentWallet && entry.user.toLowerCase() === currentWallet.toLowerCase();
              const SocialIcon =
                showSocialHandles && (entry.type === "discord" ? Discord : entry.type === "telegram" ? Telegram : null);

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
                      <span>{showSocialHandles ? entry.handle : entry.user}</span>
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
      </CardContent>
    </Card>
  );
}
