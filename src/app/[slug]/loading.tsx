import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import { useTranslations } from "next-intl";

export default function Loading() {
  const t = useTranslations("community.preview.tabs");

  return (
    <div className="max-w-prose mx-auto space-y-4 p-5 rounded-xl bg-background sticky top-0">
      {/* Community Profile Skeleton */}
      <div className="flex flex-col-reverse items-center gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" /> {/* Link Accounts button */}
          <Skeleton className="h-10 w-32" /> {/* Link Accounts button */}
        </div>
        <Skeleton className="h-16 w-16 rounded-full" /> {/* Avatar */}
      </div>

      {/* Banner Skeleton */}
      <AspectRatio ratio={16 / 9}>
        <Skeleton className="w-full h-full rounded-xl" />
      </AspectRatio>

      {/* Community Info Skeleton */}
      <div className="min-h-32 rounded-xl border p-6 space-y-2">
        <Skeleton className="h-8 w-3/4" /> {/* Title */}
        <Skeleton className="h-4 w-full" /> {/* Description line 1 */}
        <Skeleton className="h-4 w-2/3" /> {/* Description line 2 */}
      </div>

      {/* Tabs Skeleton */}
      <Tabs defaultValue="leaderboard" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="leaderboard" className="w-full">
            {t("leaderboard")}
          </TabsTrigger>
          <TabsTrigger value="badges" className="w-full">
            {t("badges")}
          </TabsTrigger>
          <TabsTrigger value="activity" className="w-full">
            {t("activity")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="leaderboard" className="space-y-2">
          <Skeleton className="h-12 w-full" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
