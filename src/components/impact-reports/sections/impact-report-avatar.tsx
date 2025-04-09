"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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