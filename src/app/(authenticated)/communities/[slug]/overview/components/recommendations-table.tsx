"use client";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import type { SortingState } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import RejectDialog from "./RejectDialog";
import RewardDialog from "./RewardDialog";
import { columns } from "./columns";

interface RecommendationsTableProps {
  community: Community;
  recommendations: RewardRecommendation[];
  onReward: (recommendation: RewardRecommendation) => void;
  onReject: (recommendation: RewardRecommendation) => void;
  deleteRecommendation: (recommendation: RewardRecommendation) => void;
  isLoading?: boolean;
}

export default function RecommendationsTable({
  community,
  recommendations,
  deleteRecommendation,
  onReward,
  onReject,
  isLoading = false,
}: RecommendationsTableProps) {
  const t = useTranslations("overview.rewardRecommendations");
  const [sorting, setSorting] = useState<SortingState>([]);

  const tableColumns = [
    ...columns(t),
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }: { row: { original: RewardRecommendation } }) => {
        const recommendation = row.original;
        return (
          <div className="flex items-center justify-end gap-2 h-10 pr-4">
            <RewardDialog
              community={community}
              recommendation={recommendation}
              deleteRecommendation={() => deleteRecommendation(recommendation)}
              onConfirm={() => onReward(recommendation)}
            >
              <Button
                className="hover:bg-primary/90 text-primary-foreground rounded-full px-6 py-0 h-8 text-sm font-medium"
                disabled={isLoading}
              >
                {t("reward")}
              </Button>
            </RewardDialog>
            <RejectDialog onConfirm={() => onReject(recommendation)}>
              <Button
                variant="destructive"
                className="hover:bg-destructive/90 text-destructive-foreground rounded-full px-6 py-0 h-8 text-sm font-medium"
                disabled={isLoading}
              >
                <Trash2 />
              </Button>
            </RejectDialog>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={tableColumns}
      data={recommendations}
      sorting={sorting}
      onSortingChange={setSorting}
    />
  );
}
