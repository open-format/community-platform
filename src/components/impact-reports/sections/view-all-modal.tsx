"use client";

import { KeyTopic, TopContributor } from "../types";
import { ExternalLink, ArrowUpDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DetailedViewModal } from "./detailed-view-modal";
import { ImpactReportAvatar } from "./impact-report-avatar";

type ColumnConfig<T> = {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
};

interface ViewAllModalProps<T extends KeyTopic | TopContributor> {
  isOpen: boolean;
  onClose: () => void;
  items: T[];
  type: "topics" | "contributors";
  columns: ColumnConfig<T>[];
  translationKey: string;
}

export function ViewAllModal<T extends KeyTopic | TopContributor>({ 
  isOpen, 
  onClose, 
  items,
  type,
  columns,
  translationKey
}: ViewAllModalProps<T>) {
  const t = useTranslations(`ImpactReports.${translationKey}`);
  const [sortField, setSortField] = useState<keyof T>("messageCount" as keyof T);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  const sortedItems = [...items].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }
    
    return sortDirection === "asc"
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  const handleSort = (field: keyof T) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead
                      key={String(column.key)}
                      className={column.sortable && typeof column.key === "string" ? "cursor-pointer" : undefined}
                      onClick={column.sortable && typeof column.key === "string" ? () => handleSort(column.key as keyof T) : undefined}
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
                {sortedItems.map((item) => (
                  <TableRow key={type === "topics" ? (item as KeyTopic).topic : (item as TopContributor).username}>
                    {columns.map((column) => (
                      <TableCell key={String(column.key)}>
                        {column.render ? column.render(item) : String(item[column.key as keyof T])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {selectedItem && type === "topics" && (
        <DetailedViewModal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={(selectedItem as KeyTopic).topic}
          description={(selectedItem as KeyTopic).description}
          evidence={(selectedItem as KeyTopic).evidence}
          translationKey={translationKey}
        />
      )}
    </>
  );
}
