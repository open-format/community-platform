"use client";

import { cn, generateGradient } from "@/lib/utils";

export function Avatar({ seed = "seed", className }: { seed: string; className?: string }) {
  return (
    <div
      className={cn("rounded-full h-12 w-12", className)}
      style={{
        background: generateGradient(seed),
      }}
    />
  );
}
