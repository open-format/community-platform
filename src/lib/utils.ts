import type { User } from "@privy-io/react-auth";
import { type ClassValue, clsx } from "clsx";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { twMerge } from "tailwind-merge";
import type { Address } from "viem";
dayjs.extend(relativeTime);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function addressSplitter(address: string, split = 5): string | null {
  if (!address) return null;

  return `${address.slice(0, split)}...${address.slice(-split)}`;
}

export function timeAgo(timestamp: number) {
  return dayjs.unix(timestamp).fromNow();
}

export function getContrastSafeColor(color: string): string {
  // Validate input format
  const hexColorRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (!hexColorRegex.test(color)) {
    throw new Error("Invalid hex color format");
  }

  // Normalize hex color (remove # and expand short form if necessary)
  const normalizedHex = color.replace("#", "").toLowerCase();
  const hex =
    normalizedHex.length === 3
      ? normalizedHex
          .split("")
          .map((char) => char + char)
          .join("")
      : normalizedHex;

  // Convert hex to RGB
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);

  // Calculate relative luminance using WCAG formula
  // https://www.w3.org/TR/WCAG20/#relativeluminancedef
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Use WCAG recommended threshold
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

export function sanitizeString(
  str: string,
  options: {
    allowedChars?: string;
    replaceSpacesWith?: string;
  } = {}
): string {
  if (!str) return "";

  const { allowedChars = "", replaceSpacesWith = " " } = options;

  return (
    str
      .normalize("NFKD")
      .trim()
      .toLowerCase()
      // Replace spaces with specified character
      .replace(/\s+/g, replaceSpacesWith)
      // Remove unwanted characters, but keep the replaceSpacesWith character
      .replace(new RegExp(`[^\\w${replaceSpacesWith}${allowedChars}]`, "g"), "")
      .trim()
  );
}

export function desanitizeString(
  str: string,
  options: {
    replaceSpacesWith?: string;
  } = {}
): string {
  if (!str) return "";

  const { replaceSpacesWith = " " } = options;

  return (
    str
      // Replace both hyphens, underscores, and the replaceSpacesWith character with spaces
      .replace(new RegExp(`[-_${replaceSpacesWith}]`, "g"), " ")
      .trim()
  );
}

export function generateGradient(seed: string) {
  // Check if the input is a hex color
  const hexColorRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (hexColorRegex.test(seed)) {
    // Convert hex to HSL for the base color
    const normalizedHex = seed.replace("#", "").toLowerCase();
    const hex =
      normalizedHex.length === 3
        ? normalizedHex
            .split("")
            .map((char) => char + char)
            .join("")
        : normalizedHex;

    const r = Number.parseInt(hex.slice(0, 2), 16) / 255;
    const g = Number.parseInt(hex.slice(2, 4), 16) / 255;
    const b = Number.parseInt(hex.slice(4, 6), 16) / 255;

    // Convert RGB to HSL
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    const d = max - min;
    let h, s;

    if (d === 0) {
      h = 0;
      s = 0;
    } else {
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        default:
          h = (r - g) / d + 4;
          break;
      }
      h *= 60;
    }

    // Create a gradient using the same hue but different lightness values
    const sat = Math.round(s * 100);
    const light = Math.round(l * 100);

    // Create slightly darker and lighter versions
    const darkerLight = Math.max(light - 15, 0);
    const lighterLight = Math.min(light + 15, 100);

    return `linear-gradient(
      45deg, 
      hsl(${h}, ${sat}%, ${darkerLight}%), 
      hsl(${h}, ${sat}%, ${light}%),
      hsl(${h}, ${sat}%, ${lighterLight}%)
    )`;
  }

  // Original string-based seed logic
  const safeSeed = seed || "defaultSeed";
  const hash1 = safeSeed.split("").reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0);
  const hash2 = safeSeed.split("").reduce((acc, char, i) => acc + char.charCodeAt(0) * (i * 2 + 1), 0);

  const hue1 = hash1 % 360;
  const hue2 = (hash1 * hash2) % 360;
  const sat1 = 65 + (hash1 % 20);
  const sat2 = 65 + (hash2 % 20);
  const light1 = 45 + (hash2 % 15);
  const light2 = 45 + (hash1 % 15);
  const angle = (hash1 + hash2) % 360;

  return `linear-gradient(
    ${angle}deg, 
    hsl(${hue1}, ${sat1}%, ${light1}%), 
    hsl(${hue2}, ${sat2}%, ${light2}%)
  )`;
}

export function getAddress(user: User | null): Address {
  if (!user) return null;

  const address = user?.linkedAccounts.find(
    (account) => account.type === "wallet" && account.connectorType === "injected"
  )?.address as Address;

  if (!address) {
    return user?.wallet?.address as Address;
  }

  return address;
}
