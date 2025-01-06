"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
import Discord from "../../public/icons/discord.svg";
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
  };
}

const LeaderboardHeader = ({ metadata }: Pick<LeaderboardProps, "metadata">) => (
  <TableHeader>
    <TableRow>
      <TableHead>Rank</TableHead>
      <TableHead>{metadata?.user_label ?? "User"}</TableHead>
      <TableHead className="text-right">{metadata?.token_label ?? "Points"}</TableHead>
    </TableRow>
  </TableHeader>
);

const LeaderboardSkeleton = () => (
  <Card className="h-full">
    <CardContent className="pt-6">
      <Table>
        <LeaderboardHeader />
        <TableBody>
          {[...Array(7)].map((_, i) => (
            <TableRow key={i}>
              <TableCell colSpan={3}>
                <Skeleton className="h-16 w-full" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

const EmptyState = ({ metadata }: Pick<LeaderboardProps, "metadata">) => (
  <Card variant="borderless" className="h-full">
    <CardContent>
      <Table>
        <LeaderboardHeader metadata={metadata} />
        <TableBody>
          <TableRow>
            <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
              No leaderboard data yet
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

export default function Leaderboard({
  data,
  metadata,
  isLoading = false,
  showSocialHandles = false,
}: LeaderboardProps) {
  const { user } = usePrivy();

  if (isLoading) return <LeaderboardSkeleton />;
  if (!data || data.length === 0) return <EmptyState metadata={metadata} />;

  return (
    <Card variant="borderless" className="h-full">
      <CardContent>
        <Table>
          <LeaderboardHeader metadata={metadata} />
          <TableBody>
            {data.map((entry, index) => {
              const position = index + 1;
              const isCurrentUser =
                user?.wallet?.address && entry.user.toLowerCase() === user?.wallet?.address.toLowerCase();
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
