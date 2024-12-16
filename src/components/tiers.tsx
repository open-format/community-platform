"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// EDIT AS NEEDED
const tiers: { name: string; pointsRequired: number; color: string }[] = [
  {
    name: "Amateur",
    pointsRequired: 1000,
    color: "bg-orange-500",
  },
  {
    name: "Pro",
    pointsRequired: 2500,
    color: "bg-green-500",
  },
  {
    name: "Expert",
    pointsRequired: 5000,
    color: "bg-sky-500",
  },
  {
    name: "Legend",
    pointsRequired: 10000,
    color: "bg-pink-500",
  },
];

export default function Tiers({ currentPoints }: { currentPoints: number }) {
  const getCurrentTier = (points: number) => {
    // Return null if user hasn't reached first tier
    if (points < tiers[0].pointsRequired) return null;

    // Find the highest tier the user qualifies for
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (points >= tiers[i].pointsRequired) {
        return tiers[i];
      }
    }
    return null;
  };

  const getProgress = (points: number, currentTier: (typeof tiers)[0] | null, nextTier: (typeof tiers)[0]) => {
    // If no current tier, calculate progress to first tier
    if (!currentTier) {
      return (points / tiers[0].pointsRequired) * 100;
    }

    // If at max tier or above max tier points, return 100%
    if (nextTier === currentTier || points >= tiers[tiers.length - 1].pointsRequired) {
      return 100;
    }

    // Calculate progress percentage
    const progressPoints = points - currentTier.pointsRequired;
    const tierRange = nextTier.pointsRequired - currentTier.pointsRequired;
    return Math.min(100, Math.max(0, (progressPoints / tierRange) * 100));
  };

  const currentTier = getCurrentTier(currentPoints);
  const nextTierIndex = currentTier ? tiers.indexOf(currentTier) + 1 : 0;
  const nextTier = nextTierIndex < tiers.length ? tiers[nextTierIndex] : tiers[tiers.length - 1];
  const progress = getProgress(currentPoints, currentTier, nextTier);

  const pointsRemaining =
    currentTier && nextTier === currentTier
      ? 0
      : Math.max(0, (currentTier ? nextTier : tiers[0]).pointsRequired - currentPoints);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Tier Progress</CardTitle>
        <p className="text-sm text-muted-foreground">Your current tier and progress towards the next</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {currentTier ? (
                <>
                  <span className="text-sm text-muted-foreground">Current Tier:</span>
                  <Badge className={`text-white ${currentTier.color}`}>{currentTier.name}</Badge>
                  <span className="text-xs text-muted-foreground">({currentPoints.toLocaleString()} points)</span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">{currentPoints.toLocaleString()} points earned</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Next Tier:</span>
              <Badge className={`text-white ${nextTier.color}`}>{nextTier.name}</Badge>
            </div>
          </div>
          <div className="space-y-1">
            <Progress value={progress} className="w-full h-3" />
            <div className="flex justify-end">
              <span className="text-sm text-muted-foreground">
                {currentTier
                  ? pointsRemaining === 0
                    ? currentPoints >= tiers[tiers.length - 1].pointsRequired
                      ? `Max tier reached (${currentPoints} points)`
                      : "Max tier reached"
                    : `${pointsRemaining} points to ${nextTier.name}`
                  : `${tiers[0].pointsRequired - currentPoints} points to ${tiers[0].name}`}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm pt-4">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  "flex flex-col items-center p-3 rounded-lg transition-colors duration-200",
                  // Only highlight if there's a current tier and it matches
                  currentTier === tier ? "dark:bg-secondary/20 bg-secondary/30" : "dark:bg-secondary/10 bg-secondary/20"
                )}
              >
                <div className={`w-3 h-3 rounded-full ${tier.color} mb-2 transition-colors duration-200`} />
                <span className="font-medium">{tier.name}</span>
                <span className="text-xs text-muted-foreground">{tier.pointsRequired} points</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
