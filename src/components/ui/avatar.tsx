"use client";

import { cn } from "@/lib/utils";

export function Avatar({ seed = "seed", className }: { seed: string; className?: string }) {
  function generateGradient(seed: string) {
    // Ensure seed is not null or undefined
    const safeSeed = seed || "defaultSeed";

    // Create multiple hash values from the seed for different color components
    const hash1 = safeSeed.split("").reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0);
    const hash2 = safeSeed.split("").reduce((acc, char, i) => acc + char.charCodeAt(0) * (i * 2 + 1), 0);

    // Generate primary hues with more variation
    const hue1 = hash1 % 360;
    const hue2 = (hash1 * hash2) % 360;

    // Generate saturation and lightness with seed influence
    const sat1 = 65 + (hash1 % 20);
    const sat2 = 65 + (hash2 % 20);
    const light1 = 45 + (hash2 % 15);
    const light2 = 45 + (hash1 % 15);

    // Create gradient with varying angle based on seed
    const angle = (hash1 + hash2) % 360;

    return `linear-gradient(
      ${angle}deg, 
      hsl(${hue1}, ${sat1}%, ${light1}%), 
      hsl(${hue2}, ${sat2}%, ${light2}%)
    )`;
  }

  return (
    <div
      className={cn("rounded-full h-16 w-16", className)}
      style={{
        background: generateGradient(seed),
      }}
    />
  );
}
