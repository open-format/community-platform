"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function Tiers({
  tiers,
  currentPoints,
  tokenLabel = "Points",
}: {
  tiers: Tier[];
  currentPoints: number;
  tokenLabel?: string | null;
}) {
  const getCurrentTier = (points: number) => {
    // Return null if user hasn't reached first tier
    if (points < tiers[0].points_required) return null;

    // Find the highest tier the user qualifies for
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (points >= tiers[i].points_required) {
        return tiers[i];
      }
    }
    return null;
  };

  const getProgress = (points: number, currentTier: (typeof tiers)[0] | null, nextTier: (typeof tiers)[0]) => {
    // If no current tier, calculate progress to first tier
    if (!currentTier) {
      return (points / tiers[0].points_required) * 100;
    }

    // If at max tier or above max tier points, return 100%
    if (nextTier === currentTier || points >= tiers[tiers.length - 1].points_required) {
      return 100;
    }

    // Calculate progress percentage
    const progressPoints = points - currentTier.points_required;
    const tierRange = nextTier.points_required - currentTier.points_required;
    return Math.min(100, Math.max(0, (progressPoints / tierRange) * 100));
  };

  const currentTier = getCurrentTier(currentPoints);
  const nextTierIndex = currentTier ? tiers.indexOf(currentTier) + 1 : 0;
  const nextTier = nextTierIndex < tiers.length ? tiers[nextTierIndex] : tiers[tiers.length - 1];
  const progress = getProgress(currentPoints, currentTier, nextTier);

  const pointsRemaining =
    currentTier && nextTier === currentTier
      ? 0
      : Math.max(0, (currentTier ? nextTier : tiers[0]).points_required - currentPoints);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Tier Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4 text-center">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {currentTier ? (
                <>
                  <span className="text-sm">Current Tier:</span>
                  <Badge style={{ backgroundColor: currentTier.color }} className="text-white">
                    {currentTier.name}
                  </Badge>
                  <span className="text-xs">
                    ({currentPoints.toLocaleString()} {tokenLabel})
                  </span>
                </>
              ) : (
                <span className="text-sm">
                  {currentPoints.toLocaleString()} {tokenLabel} earned
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Next Tier:</span>
              <Badge style={{ backgroundColor: nextTier.color }} className="text-white">
                {nextTier.name}
              </Badge>
            </div>
          </div>
          <div className="space-y-1">
            <Progress value={progress} className="w-full h-3" indicatorColor={currentTier?.color || nextTier.color} />
            <div className="flex justify-end">
              <span className="text-sm">
                {currentTier
                  ? pointsRemaining === 0
                    ? currentPoints >= tiers[tiers.length - 1].points_required
                      ? `Max tier reached (${currentPoints} ${tokenLabel})`
                      : "Max tier reached"
                    : `${pointsRemaining} ${tokenLabel} to ${nextTier.name}`
                  : `${tiers[0].points_required - currentPoints} ${tokenLabel} to ${tiers[0].name}`}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-[repeat(auto-fit,minmax(0,1fr))] gap-2 text-sm pt-4">
            {tiers.map((tier) => (
              <div key={tier.name} className={cn("flex flex-col items-center p-3 rounded-lg border-2")}>
                <div
                  style={{ backgroundColor: tier.color }}
                  className="w-6 h-6 rounded-full mb-2 transition-colors duration-200"
                />
                <span className="font-bold">{tier.name}</span>
                <span>
                  {tier.points_required} {tokenLabel}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
