"use client";

import { KeyTopic } from "../types";
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

interface ViewAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  topics: KeyTopic[];
}

export function ViewAllModal({ isOpen, onClose, topics }: ViewAllModalProps) {
  const t = useTranslations("ImpactReports.topics");
  const [sortField, setSortField] = useState<keyof KeyTopic>("messageCount");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedTopic, setSelectedTopic] = useState<KeyTopic | null>(null);

  const sortedTopics = [...topics].sort((a, b) => {
    if (sortField === "messageCount") {
      return sortDirection === "asc" 
        ? a.messageCount - b.messageCount 
        : b.messageCount - a.messageCount;
    }
    return sortDirection === "asc"
      ? a.topic.localeCompare(b.topic)
      : b.topic.localeCompare(a.topic);
  });

  const handleSort = (field: keyof KeyTopic) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleViewDetails = (topic: KeyTopic) => {
    setSelectedTopic(topic);
  };

  const handleCloseDetails = () => {
    setSelectedTopic(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => handleSort("topic")}
                  >
                    <div className="flex items-center gap-1">
                      {t("title")}
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => handleSort("messageCount")}
                  >
                    <div className="flex items-center gap-1">
                      {t("messageCount", { count: 0 })}
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>{t("evidenceCount", { count: 0 })}</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTopics.map((topic) => (
                  <TableRow key={topic.topic}>
                    <TableCell className="font-medium">{topic.topic}</TableCell>
                    <TableCell>{topic.messageCount}</TableCell>
                    <TableCell>{topic.evidence.length}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8"
                        onClick={() => handleViewDetails(topic)}
                      >
                        {t("viewDetails")}
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {selectedTopic && (
        <DetailedViewModal
          isOpen={!!selectedTopic}
          onClose={handleCloseDetails}
          title={selectedTopic.topic}
          description={selectedTopic.description}
          evidence={selectedTopic.evidence}
          translationKey="topics"
        />
      )}
    </>
  );
} 