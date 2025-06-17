"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, Eye, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { SentimentItem } from "../types";
import { DetailedViewModal } from "./detailed-view-modal";

interface SentimentViewAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: SentimentItem[];
  type: "excited" | "frustrated";
}

export function SentimentViewAllModal({
  isOpen,
  onClose,
  items,
  type,
}: SentimentViewAllModalProps) {
  const t = useTranslations("ImpactReports.sentiment");
  const [sortField, setSortField] = useState<keyof SentimentItem>("title");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedItem, setSelectedItem] = useState<SentimentItem | null>(null);

  const title = type === "excited" ? t("excited.viewAllTitle") : t("frustrated.viewAllTitle");

  const sortedItems = [...items].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (sortField === "users") {
      const aCount = Array.isArray(aValue) ? aValue.length : 0;
      const bCount = Array.isArray(bValue) ? bValue.length : 0;
      return sortDirection === "asc" ? aCount - bCount : bCount - aCount;
    }

    return sortDirection === "asc"
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  const handleSort = (field: keyof SentimentItem) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const columns = [
    {
      key: "title" as const,
      title: type === "excited" ? "Excitement" : "Frustration",
      sortable: true,
      render: (item: SentimentItem) => (
        <div className="space-y-1">
          <div className="font-medium">{item.title}</div>
          <div className="text-sm text-muted-foreground line-clamp-2">{item.description}</div>
        </div>
      ),
    },
    {
      key: "users" as const,
      title: t("userCount", { count: undefined }),
      sortable: true,
      render: (item: SentimentItem) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="whitespace-nowrap">{t("userCount", { count: item.users.length })}</span>
        </div>
      ),
    },
    {
      key: "actions" as const,
      title: "",
      render: (item: SentimentItem) => (
        <Button size="icon" className="h-8 w-8" onClick={() => setSelectedItem(item)}>
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead
                      key={String(column.key)}
                      className={column.sortable ? "cursor-pointer" : undefined}
                      onClick={
                        column.sortable
                          ? () => handleSort(column.key as keyof SentimentItem)
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-1">
                        {column.title}
                        {column.sortable && <ArrowUpDown className="h-4 w-4" />}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedItems.map((item, index) => (
                  <TableRow key={`${item.title}-${index}`}>
                    {columns.map((column) => (
                      <TableCell key={String(column.key)}>
                        {column.render
                          ? column.render(item)
                          : String(item[column.key as keyof SentimentItem])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {selectedItem && (
        <DetailedViewModal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={selectedItem.title}
          description={selectedItem.description}
          evidence={selectedItem.evidence}
          translationKey="sentiment"
        />
      )}
    </>
  );
}
