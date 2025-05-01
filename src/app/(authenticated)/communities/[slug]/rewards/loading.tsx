import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import {Separator} from "@/components/ui/separator";

export default function LoadingRewards() {
  const t = useTranslations("rewards");

  return (
    <div>
      <Card variant="borderless">
        <CardHeader>
          <CardTitle>{t("recommendations.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* User Field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Token Field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Amount Field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Reward ID Field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Metadata Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-24" />
              </div>
              <div className="space-y-2 mt-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
      <Separator className="my-lg" />
      <Card variant="borderless">
        <CardHeader>
          <CardTitle>{t('batchRewards')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* File Field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            {/* Process Button */}
            <Skeleton className="h-10 w-full" />
            {/* Settings Button */}
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
