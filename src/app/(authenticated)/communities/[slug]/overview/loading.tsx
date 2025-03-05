import { Table, TableHeader, TableHead, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useTranslations } from 'next-intl';

export default function Loading() {
  const t = useTranslations('overview.leaderboard');
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('rank')}</TableHead>
              <TableHead><Skeleton className="h-4 w-20" /></TableHead>
              <TableHead className="text-right">
                <Skeleton className="h-4 w-16 ml-auto" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(5).fill(null).map((_, index) => (
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
      </div>
      <div></div>
    </div>
  );
}
