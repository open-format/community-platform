"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { chains } from "@/constants/chains";
import { timeAgo } from "@/lib/utils";
import { CoinsIcon, ExternalLinkIcon, TrophyIcon } from "lucide-react";
import Link from "next/link";

export default function Activity({ rewards, theme }: { rewards: Reward[]; theme: Theme }) {
  // @TODO: Move idMapper to a utils file
  function idMapper(rewardId: string) {
    return rewardId.split("_").join(" ");
  }
  function getIcon(reward: Reward) {
    if (reward.badgeTokens.length > 0) {
      return <TrophyIcon />;
    }
    return <CoinsIcon />;
  }
  return (
    <Card style={theme}>
      <CardHeader>
        <CardTitle>My Journey</CardTitle>
      </CardHeader>
      <CardContent>
        {rewards.map((reward, index) => (
          <div key={reward.id}>
            <div className="flex items-center space-x-4 py-2">
              {getIcon(reward)}
              <div className="flex-1 space-y-1">
                <p className="text-sm leading-none capitalize">{idMapper(reward.rewardId)}</p>
                <p className="text-sm" style={{ color: theme.borderColor }}>
                  {timeAgo(Number(reward.createdAt))}
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
        ))}
      </CardContent>
    </Card>
  );
}
