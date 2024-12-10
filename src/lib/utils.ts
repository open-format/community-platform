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
