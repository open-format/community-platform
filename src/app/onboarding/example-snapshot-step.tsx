"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";

export default function ExampleSnapshotStep({ onNext }: { onNext?: () => void }) {
  const t = useTranslations();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchReport() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(`/api/v1/reports/impact/${process.env.NEXT_PUBLIC_EXAMPLE_REPORT_ID}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setReport(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="text-2xl font-bold mb-2">{t("onboarding.exampleSnapshot.title")}</h1>
        <p className="text-muted-foreground mb-4">{t("onboarding.exampleSnapshot.intro")}</p>
        {loading ? (
          <div>{t("onboarding.exampleSnapshot.loading")}</div>
        ) : error ? (
          <div className="text-red-500">{t("onboarding.exampleSnapshot.unavailable")}</div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{report.title || t("onboarding.exampleSnapshot.reportTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Render report content here: stats, contributors, sentiment, etc. */}
              <pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify(report, null, 2)}</pre>
            </CardContent>
          </Card>
        )}
        {onNext && (
          <div className="flex justify-end mt-8">
            <Button onClick={onNext}>{t("onboarding.exampleSnapshot.continue")}</Button>
          </div>
        )}
      </div>
    </div>
  );
} 