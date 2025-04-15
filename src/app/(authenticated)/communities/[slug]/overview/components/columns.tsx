"use client";

import { Button } from "@/components/ui/button";
import { type ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { ArrowUpDown } from "lucide-react";
import { useTranslations } from "next-intl";

export type RewardRecommendation = {
  id: string;
  contributor_name: string;
  wallet_address: string;
  summary: string;
  points: number;
  created_at: string;
  platform_id: string;
  community_id: string;
  status: string;
};

export const columns = (
  t: ReturnType<typeof useTranslations>,
): ColumnDef<RewardRecommendation>[] => [
  {
    accessorKey: "contributor_name",
    header: t("whatHappened"),
    cell: ({ row }) => {
      const rewardRecommendation = row.original;
      return (
        <div className="py-2">
          <span className="font-bold">{rewardRecommendation.contributor_name}</span>
          &nbsp;
          {rewardRecommendation.summary}
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
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
          <span>{points}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <div className="text-left">
          <Button
            variant="ghost"
            className="hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("createdAt")}
            <ArrowUpDown className="h-2" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const createdAt = row.getValue("created_at") as string;
      return (
        <div className="font-medium">
          <span>{dayjs(createdAt).fromNow()}</span>
        </div>
      );
    },
  },
];
