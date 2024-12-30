"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { chains } from "@/constants/chains";
import { addressSplitter, desanitizeString, timeAgo } from "@/lib/utils";
import { CoinsIcon, ExternalLinkIcon, TrophyIcon } from "lucide-react";
import Link from "next/link";

export default function Activity({
  rewards,
  theme,
  title = "Activity",
  showUserAddress = false,
}: {
  rewards: Reward[];
  theme: Theme;
  showUserAddress?: boolean;
  title?: string;
}) {
  function getIcon(reward: Reward) {
    if (reward.badgeTokens.length > 0) {
      return <TrophyIcon />;
    }
    return <CoinsIcon />;
  }
  return (
    <Card variant="borderless" style={theme}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {!rewards.length ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">No activity yet</p>
          </div>
        ) : (
          rewards.map((reward, index) => (
            <div key={reward.id}>
              <div className="flex items-center space-x-4 py-2">
                {getIcon(reward)}
                <div className="flex-1 space-y-1">
                  <p className="text-sm leading-none">
                    {showUserAddress ? (
                      <>
                        <span className="capitalize">{desanitizeString(reward.rewardId)}</span>
                        <span> • </span>
                        <span>{timeAgo(Number(reward.createdAt))}</span>
                      </>
                    ) : (
                      <span className="capitalize">{desanitizeString(reward.rewardId)}</span>
                    )}
                  </p>
                  <p className="text-sm" style={{ color: theme.borderColor }}>
                    {showUserAddress ? `user: ${addressSplitter(reward.user?.id)}` : timeAgo(Number(reward.createdAt))}
                  </p>
                </div>
                <Link
                  href={`${chains.arbitrumSepolia.BLOCK_EXPLORER_URL}/tx/${reward.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLinkIcon className="h-4 w-4" />
                </Link>
              </div>
              {index < rewards.length - 1 && <Separator className="my-2" />}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
