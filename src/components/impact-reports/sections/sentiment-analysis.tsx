"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SentimentItem, UserSentiment } from "../types";
import { ExternalLink, ThumbsUp, ThumbsDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { SentimentItemComponent } from "./sentiment-item";
import { SentimentViewAllModal } from "./sentiment-view-all-modal";
import { useState } from "react";

interface SentimentAnalysisProps {
  sentiment: UserSentiment;
}

function SentimentList({ 
  items, 
  type, 
  onViewAll 
}: { 
  items: SentimentItem[]; 
  type: 'excited' | 'frustrated';
  onViewAll: () => void;
}) {
  const t = useTranslations("ImpactReports.sentiment");
  
  if (items.length === 0) return null;

  const topFive = items.slice(0, 5);

  return (
    <div className="space-y-4">
      {topFive.map((item) => (
        <SentimentItemComponent key={item.title} item={item} type={type} />
      ))}
      {items.length > 5 && (
        <div className="pt-4">
          <Button variant="outline" size="sm" className="w-full" onClick={onViewAll}>
            {t("viewAll", { type: type === 'excited' ? 'Excitement' : 'Frustrations' })}
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export function SentimentAnalysis({ sentiment }: SentimentAnalysisProps) {
  const t = useTranslations("ImpactReports.sentiment");
  const [excitementModalOpen, setExcitementModalOpen] = useState(false);
  const [frustrationsModalOpen, setFrustrationsModalOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ThumbsUp className="h-5 w-5" />
              {t("excited.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SentimentList 
              items={sentiment.excitement} 
              type="excited" 
              onViewAll={() => setExcitementModalOpen(true)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ThumbsDown className="h-5 w-5" />
              {t("frustrated.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SentimentList 
              items={sentiment.frustrations} 
              type="frustrated" 
              onViewAll={() => setFrustrationsModalOpen(true)}
            />
          </CardContent>
        </Card>
      </div>

      <SentimentViewAllModal
        isOpen={excitementModalOpen}
        onClose={() => setExcitementModalOpen(false)}
        items={sentiment.excitement}
        type="excited"
      />

      <SentimentViewAllModal
        isOpen={frustrationsModalOpen}
        onClose={() => setFrustrationsModalOpen(false)}
        items={sentiment.frustrations}
        type="frustrated"
      />
    </>
  );
}
