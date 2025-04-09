"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRecommendations } from "@/hooks/useRecommendations";

type RewardRecommendation = ReturnType<typeof useRecommendations>["recommendations"][number];
import { cx } from "class-variance-authority";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface RecommendationsTableProps {
  recommendations: RewardRecommendation[];
  onReward: (recommendation: RewardRecommendation) => void;
  onReject: (recommendation: RewardRecommendation) => void;
}

export default function RecommendationsTable({
  recommendations,
  onReward,
  onReject,
}: RecommendationsTableProps) {
  const t = useTranslations("overview.rewardRecommendations");
  const [sorting, setSorting] = useState<SortingState>([]);

  // Helper function to generate activity descriptions
  const getActivityDescription = (recommendation: RewardRecommendation) => {
    // This is a placeholder - in a real implementation, you'd use the actual data
    // from the recommendation to generate appropriate descriptions
    switch (recommendation.id.charAt(0)) {
      case "1":
        return `helped ${getRandomName()} with an issue`;
      case "9":
        if (recommendation.contributorName === "John Smith") {
          return "fixed an important bug in the base code";
        } else if (recommendation.contributorName === "Pepe Vega") {
          return "created a new feature for the community";
        }
        return "contributed to the community";
      default:
        return "made a valuable contribution";
    }
  };

  // Helper to generate random names for the activity descriptions
  const getRandomName = () => {
    const names = ["Alex", "Jamie", "Taylor", "Jordan", "Casey"];
    return names[Math.floor(Math.random() * names.length)];
  };

  const columns: ColumnDef<RewardRecommendation>[] = [
    {
      accessorKey: "contributorName",
      header: t("whatHappened"),
      cell: ({ row }) => {
        const rewardRecommendation = row.original;
        return (
          <div className="flex items-center justify-start gap-2 py-0">
            <div className="w-6 h-5 flex-shrink-0">
              <svg
                className="w-5 h-5 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm.24 5.4c.6 0 1.08.48 1.08 1.08s-.48 1.08-1.08 1.08-1.08-.48-1.08-1.08.48-1.08 1.08-1.08zm2.28 12.48c-.96 0-1.44-.84-1.44-1.68 0-.72 1.2-2.4 1.2-2.4s1.2 1.68 1.2 2.4c0 .84-.48 1.68-1.44 1.68h.48zm-4.2-2.76c-.6 0-1.08-.48-1.08-1.08s.48-1.08 1.08-1.08 1.08.48 1.08 1.08-.48 1.08-1.08 1.08zm0-4.32c-.6 0-1.08-.48-1.08-1.08s.48-1.08 1.08-1.08 1.08.48 1.08 1.08-.48 1.08-1.08 1.08z" />
              </svg>
            </div>
            <div className="flex flex-row gap-1">
              <span className="font-medium">
                {rewardRecommendation.contributorName}
              </span>
              <span className="text-sm text-muted-foreground">
                {getActivityDescription(rewardRecommendation)}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "points",
      header: ({ column }) => {
        return (
          <div className="text-left">
            <Button
              variant="ghost"
              className="hover:bg-transparent px-0 py-0"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {t("suggestedReward")}
              <ArrowUpDown className="h-2" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const points = row.getValue("points") as number;
        return (
          <div className="font-medium">
            <span>{points} Kudos</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-end gap-2 h-10 pr-4">
            <Button
              className="hover:bg-primary/90 text-primary-foreground rounded-full px-6 py-0 h-8 text-sm font-medium"
              onClick={() => onReward(row.original)}
            >
              {t("reward")}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">{t("openMenu")}</span>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => onReject(row.original)}
                >
                  {t("reject")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: recommendations,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div className="rounded-md border w-full overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className={cx(
                      "font-medium px-4 py-0 h-1",
                      header.id === "contributorName" && "w-full"
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-4 py-0">
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
              >
                {t("noData")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
