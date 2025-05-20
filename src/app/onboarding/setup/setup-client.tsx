"use client";

import { Button } from "@/components/ui/button";
import { usePollingJob } from "@/hooks/useJobStatus";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, CheckCircle, Loader2, BarChart2, Users, FileText, Check } from "lucide-react";

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

  const isComplete = reportStatus === "completed" && recommendationsStatus === "completed";

  // Add loading state for continue button
  const isContinueLoading = (reportStatus === "pending" || reportStatus === "processing" || 
                           recommendationsStatus === "pending" || recommendationsStatus === "processing");

  // Step data for rendering
  const steps = [
    {
      key: "platforms",
      icon: <Users className="h-6 w-6" />, 
      title: "Connecting community platforms",
      description: "Successfully connected to your community platforms.",
      status: "completed" as JobStatus, 
      isJob: false,
    },
    {
      key: "insights",
      icon: <FileText className="h-6 w-6" />, 
      title: "Generating initial insights",
      description: "Initial community insights generated and ready to view.",
      status: recommendationsStatus as JobStatus,
      isJob: true,
    },
    {
      key: "analytics",
      icon: <BarChart2 className="h-6 w-6" />, 
      title: "Setting up analytics",
      description: "Analytics engine configured to track community engagement.",
      status: reportStatus as JobStatus,
      isJob: true,
    },
  ];

  const whatsNext = [
    "View your community snapshot in the dashboard",
    "Set up your community token to reward contributions",
    "Create badges to recognize community achievements",
    "Configure your community hub for members",
  ];

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

  const handleRetry = (jobType: 'report' | 'recommendations') => {
    const params = new URLSearchParams(searchParams.toString());
    if (jobType === 'report') {
      params.delete('reportJobId');
      localStorage.removeItem('reportJobId');
    } else {
      params.delete('recommendationsJobId');
      localStorage.removeItem('recommendationsJobId');
    }
    router.push(`/onboarding/integrations?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center mb-4">
        <CheckCircle className="h-12 w-12 text-yellow-400 mb-2" />
        <h2 className="text-2xl font-bold text-white mb-1">Deployment Complete!</h2>
        <p className="text-gray-400 text-center max-w-md">Your community agent is now active and collecting insights.</p>
      </div>
      <div className="flex flex-col gap-4">
        {steps.map((step, idx) => (
          <div
            key={step.key}
            className={`flex items-start gap-4 rounded-xl border border-zinc-800 bg-[#18181b] px-5 py-4 ${step.status === "completed" ? "opacity-100" : step.status === "failed" ? "border-red-500" : "opacity-90"}`}
          >
            <div className="flex-shrink-0 mt-1">
              {getStatusIcon(step.status as JobStatus)}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-white mb-0.5">{step.title}</div>
              <div className="text-gray-400 text-sm mb-1">{step.description}</div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {step.isJob ? getStatusText(step.status as JobStatus) : (step.status === "completed" ? "Completed" : "In progress")}
                </div>
                {step.isJob && step.status === "failed" && (
                  <button
                    onClick={() => handleRetry(step.key === "insights" ? "recommendations" : "report")}
                    className="text-xs text-yellow-400 hover:text-yellow-300"
                  >
                    {t("retry")}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {isComplete && (
        <>
          <div className="bg-zinc-800/70 rounded-xl p-6 mt-4 border border-zinc-700">
            <div className="font-semibold text-white mb-3">What's Next?</div>
            <ul className="space-y-2">
              {whatsNext.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                  <CheckCircle className="h-4 w-4 text-yellow-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-end mt-6">
            <Button 
              className="rounded-lg bg-yellow-400 text-black font-semibold py-2 px-6 shadow hover:bg-yellow-300 transition-colors duration-150"
              onClick={() => router.push("/dashboard")}
              disabled={isContinueLoading}
            >
              {isContinueLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("loading")}
                </div>
              ) : (
                t("continue")
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
} 