"use client";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import type { PaginationState, SortingState } from "@tanstack/react-table";
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
  deleteRecommendation: (recommendation: RewardRecommendation, showToast?: boolean) => void;
  isDeleting?: boolean;
  isLoading?: boolean;
  // Pagination props
  pagination: PaginationState;
  onPaginationChange: (pagination: PaginationState) => void;
  totalCount: number;
}

export default function RecommendationsTable({
  community,
  recommendations,
  deleteRecommendation,
  onReward,
  isDeleting = false,
  isLoading = false,
  pagination,
  onPaginationChange,
  totalCount,
}: RecommendationsTableProps) {
  const t = useTranslations("overview.rewardRecommendations");
  const [sorting, setSorting] = useState<SortingState>([{ id: "created_at", desc: true }]);

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
              deleteRecommendation={() => deleteRecommendation(recommendation, false)}
              onConfirm={() => onReward(recommendation)}
            >
              {t("reward")}
            </RewardDialog>
            <RejectDialog onConfirm={() => deleteRecommendation(recommendation)}>
              <Button
                variant="destructive"
                className="hover:bg-destructive/90 text-destructive-foreground rounded-full px-6 py-0 h-8 text-sm font-medium"
                disabled={isDeleting}
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
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      totalCount={totalCount}
      manualPagination={true}
    />
  );
}
