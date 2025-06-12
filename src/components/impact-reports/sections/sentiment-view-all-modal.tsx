"use client";

import { SentimentItem } from "../types";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SentimentItemComponent } from "./sentiment-item";

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
  type
}: SentimentViewAllModalProps) {
  const t = useTranslations("ImpactReports.sentiment");
  
  const title = type === "excited" 
    ? t("excited.viewAllTitle") 
    : t("frustrated.viewAllTitle");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 max-h-[60vh] overflow-y-auto">
          {items.map((item) => (
            <div key={item.title} className="border-b border-border pb-4 last:border-b-0">
              <SentimentItemComponent item={item} type={type} />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
