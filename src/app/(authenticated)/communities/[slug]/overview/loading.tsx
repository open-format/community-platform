import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export default function Loading() {
  const t = useTranslations("overview");

  return (
    <div>
      {/* Shortcuts skeleton matching Onboarding component */}
      <div className="space-y-4 py-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(3)
            .fill(null)
            .map((_, i) => (
              <Card key={i} className="flex flex-col justify-between">
                <CardHeader>
                  <CardTitle>
                    <Skeleton className="h-6 w-48" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
                <CardFooter className="flex space-x-2">
                  <Skeleton className="h-10 w-28" />
                  <Skeleton className="h-10 w-28" />
                </CardFooter>
              </Card>
            ))}
        </div>
      </div>

      <Separator className="my-lg" />

      <div className="grid grid-cols-2 gap-4">
        {/* Leaderboard Card */}
        <Card variant="borderless" className="h-full">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold tracking-tight">{t("leaderboard.title")}</CardTitle>
                <CardDescription>{t("leaderboard.description")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-4 px-6">
              <div className="space-y-2">
                <Skeleton className="h-5 w-16" /> {/* Label */}
                <Skeleton className="h-10 w-[180px]" /> {/* Select */}
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("leaderboard.rank")}</TableHead>
                  <TableHead>
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                  <TableHead className="text-right">
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array(5)
                  .fill(null)
                  .map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div
                          className={cn(
                            "w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold",
                            index === 0
                              ? "bg-yellow-500 text-white"
                              : index === 1
                              ? "bg-gray-300 text-gray-800"
                              : index === 2
                              ? "bg-amber-600 text-white"
                              : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400"
                          )}
                        >
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-40" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-4 w-20 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Activity Card */}
        <Card variant="borderless">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl font-bold tracking-tight">{t("activity.title")}</CardTitle>
            </div>
            <CardDescription>{t("activity.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            {Array(5)
              .fill(null)
              .map((_, i) => (
                <div key={i} className="flex items-center gap-4 mb-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
