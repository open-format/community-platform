import { type ClassValue, clsx } from "clsx";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { twMerge } from "tailwind-merge";
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
