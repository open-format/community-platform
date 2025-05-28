"use client";

import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Loading() {
  const pathname = usePathname();

  // Only show loading state if we're exactly on /communities
  if (pathname !== "/communities") {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin" />
    </div>
  );
}
