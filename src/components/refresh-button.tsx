"use client";

import { revalidate } from "@/lib/openformat";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

interface RefreshButtonProps {
  onClick?: () => Promise<void>;
}

export default function RefreshButton({ onClick }: RefreshButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleClick = () => {
    setIsLoading(true);

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const newTimeout = setTimeout(async () => {
      try {
        if (onClick) {
          await onClick();
        }
        await revalidate();
      } finally {
        setIsLoading(false);
      }
    }, 2500); // 5 seconds debounce

    setDebounceTimeout(newTimeout as NodeJS.Timeout);
  };

  return (
    <Button className="p-0 hover:bg-transparent" variant="ghost" onClick={handleClick} disabled={isLoading}>
      <RefreshCw className={cn("w-4 h-4", { "animate-spin": isLoading })} />
    </Button>
  );
}
