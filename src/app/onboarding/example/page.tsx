import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import { fetchReport } from "@/lib/openformat";
import ExampleSnapshotClient from "./example-client";

export default async function ExampleSnapshotPage() {
  const t = await getTranslations();

  // Ensure we have a valid report ID
  const reportId = process.env.NEXT_PUBLIC_EXAMPLE_REPORT_ID;
  if (!reportId) {
    throw new Error("NEXT_PUBLIC_EXAMPLE_REPORT_ID is not defined");
  }

  // Fetch the example report on the server
  const report = await fetchReport(reportId);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="text-2xl font-bold mb-2">{t("onboarding.exampleSnapshot.title")}</h1>
        <p className="text-muted-foreground mb-4">{t("onboarding.exampleSnapshot.intro")}</p>
        <ExampleSnapshotClient report={report} />
      </div>
    </div>
  );
} 