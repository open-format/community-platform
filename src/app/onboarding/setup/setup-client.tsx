"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePollingJob } from "@/hooks/useJobStatus";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

type JobStatus = "idle" | "pending" | "processing" | "completed" | "failed";

export default function SetupClient() {
  const t = useTranslations("onboarding.setup");
  const router = useRouter();
  const searchParams = useSearchParams();
  const guildId = searchParams.get("guildId");
  
  const [reportJobId, setReportJobId] = useState<string | null>(null);
  const [recommendationsJobId, setRecommendationsJobId] = useState<string | null>(null);

  useEffect(() => {
    const reportId = searchParams.get("reportJobId") || localStorage.getItem("reportJobId");
    const recId = searchParams.get("recommendationsJobId") || localStorage.getItem("recommendationsJobId");
    setReportJobId(reportId);
    setRecommendationsJobId(recId);
    if (reportId) localStorage.setItem("reportJobId", reportId);
    if (recId) localStorage.setItem("recommendationsJobId", recId);
  }, [searchParams]);

  // Report generation job status
  const { 
    status: reportStatus, 
    isLoading: isReportLoading,
    message: reportMessage 
  } = usePollingJob({
    statusEndpoint: (jobId) => `/api/onboarding/report-job-status?jobId=${jobId}`,
    initialJobId: reportJobId || undefined,
    onStatusChange: (status, message) => {
      if (status === "failed") {
        toast.error(message || t("errors.reportFailed"));
      }
    }
  });

  // Reward recommendations job status
  const { 
    status: recommendationsStatus, 
    isLoading: isRecommendationsLoading,
    message: recommendationsMessage 
  } = usePollingJob({
    statusEndpoint: (jobId) => `/api/onboarding/recommendations-job-status?jobId=${jobId}`,
    initialJobId: recommendationsJobId || undefined,
    onStatusChange: (status, message) => {
      if (status === "failed") {
        toast.error(message || t("errors.recommendationsFailed"));
      }
    }
  });

  useEffect(() => {
    if (!guildId || !reportJobId || !recommendationsJobId) {
      console.error("Setup: Missing required parameters:", { guildId, reportJobId, recommendationsJobId });
      toast.error(t("errors.missingParameters"));
      return;
    }

    console.log("Setup: Monitoring job statuses:", {
      guildId,
      reportJobId,
      recommendationsJobId,
      reportStatus,
      recommendationsStatus,
      isReportLoading,
      isRecommendationsLoading
    });
  }, [guildId, reportJobId, recommendationsJobId, reportStatus, recommendationsStatus, isReportLoading, isRecommendationsLoading, t]);

  const isComplete = reportStatus === "completed" && recommendationsStatus === "completed";

  const getStatusIcon = (status: JobStatus) => {
    switch (status) {
      case "pending":
      case "processing":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
    }
  };

  const getStatusText = (status: JobStatus) => {
    switch (status) {
      case "idle":
        return t("status.idle");
      case "pending":
        return t("status.pending");
      case "processing":
        return t("status.processing");
      case "completed":
        return t("status.completed");
      case "failed":
        return t("status.failed");
      default:
        return t("status.unknown");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("report.title")}</CardTitle>
          <CardDescription>{t("report.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {getStatusIcon(reportStatus as JobStatus)}
            <span>{getStatusText(reportStatus as JobStatus)}</span>
            {reportStatus === "failed" && (
              <Button size="sm" variant="outline" onClick={() => window.location.reload()} className="ml-2">
                {t("retry")}
              </Button>
            )}
          </div>
          {reportStatus === "failed" && reportMessage && (
            <div className="text-destructive text-sm mt-2">{reportMessage}</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("recommendations.title")}</CardTitle>
          <CardDescription>{t("recommendations.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {getStatusIcon(recommendationsStatus as JobStatus)}
            <span>{getStatusText(recommendationsStatus as JobStatus)}</span>
            {recommendationsStatus === "failed" && (
              <Button size="sm" variant="outline" onClick={() => window.location.reload()} className="ml-2">
                {t("retry")}
              </Button>
            )}
          </div>
          {recommendationsStatus === "failed" && recommendationsMessage && (
            <div className="text-destructive text-sm mt-2">{recommendationsMessage}</div>
          )}
        </CardContent>
      </Card>

      {isComplete && (
        <div className="flex justify-end">
          <Button onClick={() => router.push("/dashboard")}>
            {t("continue")}
          </Button>
        </div>
      )}
    </div>
  );
} 