"use client";

import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePathname } from "next/navigation";
import { useTranslations } from 'next-intl';

export default function Loading() {
  const pathname = usePathname();
  const t = useTranslations('communities');

  // Only show loading state if we're exactly on /communities
  if (pathname !== "/communities") {
    return null;
  }

  return (
    <div className="space-y-lg">
      <div className="flex justify-between items-center mb-6">
        <h1>{t('yourCommunities')}</h1>
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-xl">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3 mt-2" />
            </CardHeader>
            <CardFooter className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
