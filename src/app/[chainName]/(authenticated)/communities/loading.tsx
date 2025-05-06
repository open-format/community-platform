"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from 'next-intl';

export default function Loading() {
  const t = useTranslations('communities');

  return (
    <div className="space-y-lg">
      <div className="flex justify-between items-center mb-6">
        <h1>{t('yourCommunities')}</h1>
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-xl">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-[180px]" />
              </CardTitle>
              <CardDescription>
                <Skeleton className="h-4 w-[140px]" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[80%]" />
                <Skeleton className="h-4 w-[60%]" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
