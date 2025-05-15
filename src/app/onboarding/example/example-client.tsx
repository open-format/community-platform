"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

interface ExampleSnapshotClientProps {
  report: any; // TODO: Type this properly based on the report structure
}

export default function ExampleSnapshotClient({ report }: ExampleSnapshotClientProps) {
  const t = useTranslations();
  const router = useRouter();

  const handleContinue = () => {
    router.push("/onboarding/integrations");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">{t("onboarding.exampleSnapshot.reportTitle")}</h2>
        {report ? (
          <pre className="whitespace-pre-wrap text-sm">
            {JSON.stringify(report, null, 2)}
          </pre>
        ) : (
          <p className="text-muted-foreground">{t("onboarding.exampleSnapshot.unavailable")}</p>
        )}
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleContinue}>
          {t("onboarding.exampleSnapshot.continue")}
        </Button>
      </div>
    </div>
  );
} 