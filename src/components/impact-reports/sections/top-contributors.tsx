"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopContributor } from "../types";
import { ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ContributorItemComponent } from "./contributor-item";

interface TopContributorsProps {
  contributors: TopContributor[];
}

export function TopContributors({ contributors }: TopContributorsProps) {
  const t = useTranslations("ImpactReports.contributors");
  
  if (contributors.length === 0) return null;

  const topFive = contributors.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topFive.map((contributor) => (
            <ContributorItemComponent key={contributor.username} contributor={contributor} />
          ))}
          {contributors.length > 5 && (
            <div className="pt-4">
              <Button variant="outline" size="sm" className="w-full">
                {t("viewAll")}
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 