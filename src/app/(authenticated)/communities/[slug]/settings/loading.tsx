import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";

export default function LoadingCommunitySettings() {
  const t = useTranslations("settings");

  return (
    <Card variant="borderless">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full space-y-4">
          {/* Name field skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-48" />
          </div>

          {/* Description field skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-64" />
          </div>

          {/* Slug field skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-56" />
          </div>

          {/* Color pickers skeleton */}
          <div className="flex gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>

          {/* Logo URL field skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-72" />
          </div>

          {/* Social handles toggle skeleton */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-6 w-10" />
          </div>

          {/* Submit button skeleton */}
          <Skeleton className="h-10 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}
