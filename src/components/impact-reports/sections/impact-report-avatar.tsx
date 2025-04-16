"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ImpactReportAvatarProps {
  username: string;
  rank?: number;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12"
};

function Avatar({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}>
      {children}
    </div>
  );
}

function AvatarImage({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} className="aspect-square h-full w-full" />;
}

function AvatarFallback({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
      {children}
    </div>
  );
}

export function ImpactReportAvatar({ username, rank, size = "md" }: ImpactReportAvatarProps) {
  const initials = username
    .split('_')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative">
      <Avatar className={sizeClasses[size]}>
        <AvatarImage 
          src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username)}`} 
          alt={username}
        />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      {rank && rank <= 3 && (
        <div className="absolute -top-2 -right-2">
          <Badge variant={rank === 1 ? "default" : "secondary"} className="h-6 w-6 p-0 flex items-center justify-center">
            {rank}
          </Badge>
        </div>
      )}
    </div>
  );
} 