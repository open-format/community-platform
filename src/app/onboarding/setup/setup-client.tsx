"use client";

import { OnboardingProgressBar } from "@/components/onboarding/onboarding-progress";
import { Button } from "@/components/ui/button";
import { usePollingJob } from "@/hooks/useJobStatus";
import { usePrivy } from "@privy-io/react-auth";
import { AlertCircle, BarChart2, CheckCircle, FileText, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type JobStatus = "idle" | "pending" | "processing" | "completed" | "failed";

export default function SetupClient() {
  const t = useTranslations("onboarding.setup");
  const router = useRouter();
  const searchParams = useSearchParams();
  const guildId = searchParams.get("guildId");
  const communityId = searchParams.get("communityId");
  const { user } = usePrivy();

  const [messagesJobId, setMessagesJobId] = useState<string | null>(null);
  const [reportJobId, setReportJobId] = useState<string | null>(null);
  const [recommendationsJobId, setRecommendationsJobId] = useState<string | null>(null);
  const jobsStartedRef = useRef(false);
  const eventFiredRef = useRef({
    fetchHistoricalMessages: false,
    notEnoughMessages: false,
    rewardRecommendations: false,
    communitySnapshot: false,
  });

  const { status: messagesStatus, data: messagesData } = usePollingJob({
    statusEndpoint: (jobId) => `/api/onboarding/messages-job-status?jobId=${jobId}`,
    initialJobId: messagesJobId || undefined,
    onStatusChange: (status, message) => {
      if (status === "failed") {
        toast.error(message || t("errors.messagesFailed"));
      }
    },
  });

  const { status: reportStatus } = usePollingJob({
    statusEndpoint: (jobId) => `/api/onboarding/report-job-status?jobId=${jobId}`,
    initialJobId: reportJobId || undefined,
    onStatusChange: (status, message) => {
      if (status === "failed") {
        toast.error(message || t("errors.reportFailed"));
      }
    },
  });

  const { status: recommendationsStatus } = usePollingJob({
    statusEndpoint: (jobId) => `/api/onboarding/recommendations-job-status?jobId=${jobId}`,
    initialJobId: recommendationsJobId || undefined,
    onStatusChange: (status, message) => {
      if (status === "failed") {
        toast.error(message || t("errors.recommendationsFailed"));
      }
    },
  });

  const { startJobAsync: startMessagesJobAsync } = usePollingJob({
    startJobEndpoint: "/api/onboarding/start-messages-job",
    statusEndpoint: (jobId) => `/api/onboarding/messages-job-status?jobId=${jobId}`,
  });

  const { startJobAsync: startReportJobAsync } = usePollingJob({
    startJobEndpoint: "/api/onboarding/start-report-job",
    statusEndpoint: (jobId) => `/api/onboarding/report-job-status?jobId=${jobId}`,
  });

  const { startJobAsync: startRecommendationsJobAsync } = usePollingJob({
    startJobEndpoint: "/api/onboarding/start-recommendations-job",
    statusEndpoint: (jobId) => `/api/onboarding/recommendations-job-status?jobId=${jobId}`,
  });

  // Start the initial messages job when component mounts
  useEffect(() => {
    const startInitialJob = async () => {
      if (!guildId || jobsStartedRef.current) return;

      try {
        jobsStartedRef.current = true;
        const messagesResponse = await startMessagesJobAsync?.({ platformId: guildId });
        if (messagesResponse?.job_id) {
          setMessagesJobId(messagesResponse.job_id);
        }
      } catch (error) {
        console.error("Failed to start messages job:", error);
        toast.error(t("errors.messagesFailed"));
        jobsStartedRef.current = false;
      }
    };

    startInitialJob();
  }, [guildId, startMessagesJobAsync, t]);

  // Watch for messages job completion and start remaining jobs
  useEffect(() => {
    const startRemainingJobs = async () => {
      if (messagesStatus === "completed" && guildId && communityId) {
        try {
          const [reportResponse, recommendationsResponse] = await Promise.all([
            startReportJobAsync?.({ platformId: guildId }),
            startRecommendationsJobAsync?.({ platformId: guildId, communityId }),
          ]);

          const reportJobId = reportResponse?.jobId || reportResponse?.job_id;
          if (reportJobId) {
            setReportJobId(reportJobId);
          }
          if (recommendationsResponse?.job_id) {
            setRecommendationsJobId(recommendationsResponse.job_id);
          }
        } catch (error) {
          console.error("Failed to start remaining jobs:", error);
          toast.error(t("errors.jobStartFailed"));
        }
      }
    };

    startRemainingJobs();
  }, [
    guildId,
    communityId,
    startReportJobAsync,
    startRecommendationsJobAsync,
    messagesStatus,
    messagesData,
  ]);

  const isComplete =
    reportStatus === "completed" &&
    recommendationsStatus === "completed" &&
    messagesStatus === "completed";

  // Add loading state for continue button
  const isContinueLoading =
    reportStatus === "pending" ||
    reportStatus === "processing" ||
    recommendationsStatus === "pending" ||
    recommendationsStatus === "processing" ||
    messagesStatus === "pending" ||
    messagesStatus === "processing";

  // Calculate progress based on job status
  const getProgress = () => {
    if (!reportJobId || !recommendationsJobId || !messagesJobId) return 0.33;

    let completedJobs = 0;
    if (reportStatus === "completed") completedJobs++;
    if (recommendationsStatus === "completed") completedJobs++;
    if (messagesStatus === "completed") completedJobs++;

    return completedJobs / 3;
  };

  // Progress bar steps
  const progressSteps = [{ label: "Connect your community" }, { label: "Setting up your Copilot" }];

  // Status card steps
  const statusSteps = [
    {
      key: "messages",
      icon: <FileText className="h-6 w-6" />,
      title: "Fetching Historical Messages",
      description: "Collecting historical messages from your connected platforms.",
      status: messagesStatus as JobStatus,
      isJob: true,
    },
    {
      key: "insights",
      icon: <FileText className="h-6 w-6" />,
      title: "Generating Reward Recommendations",
      description: "Reward recommendations highlight top contributors and help you recognise them.",
      status: recommendationsStatus as JobStatus,
      isJob: true,
    },
    {
      key: "analytics",
      icon: <BarChart2 className="h-6 w-6" />,
      title: "Generating Community Snapshot",
      description: "Your community snapshot will give you a quick overview of your community.",
      status: reportStatus as JobStatus,
      isJob: true,
    },
  ];

  // First bar always filled (1), second bar shows job progress
  const progresses = [1, getProgress()];

  const whatsNext = [
    "See your first insight report",
    "Review today's reward recommendations",
    "Setup your community token to reward contributions",
    "Ask your Copilot questions about your community in Discord",
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

  const handleRetry = async (jobType: "report" | "recommendations" | "messages") => {
    try {
      if (jobType === "messages") {
        if (!guildId) throw new Error("Missing guildId");
        const messagesResponse = await startMessagesJobAsync?.({ platformId: guildId });
        if (messagesResponse?.job_id) {
          setMessagesJobId(messagesResponse.job_id);
        } else {
          throw new Error("Failed to start messages job");
        }
      } else if (jobType === "report") {
        if (!guildId) throw new Error("Missing guildId");
        const reportResponse = await startReportJobAsync?.({ platformId: guildId });
        if (reportResponse?.job_id) {
          setReportJobId(reportResponse.job_id);
        } else {
          throw new Error("Failed to start report job");
        }
      } else {
        if (!guildId || !communityId) throw new Error("Missing guildId or communityId");
        const recommendationsResponse = await startRecommendationsJobAsync?.({
          platformId: guildId,
          communityId,
        });
        if (recommendationsResponse?.job_id) {
          setRecommendationsJobId(recommendationsResponse.job_id);
        } else {
          throw new Error("Failed to start recommendations job");
        }
      }
    } catch (error) {
      console.error("Retry failed:", error);
      toast.error(t("errors.jobRetryFailed"));
    }
  };

  useEffect(() => {
    if (reportStatus && recommendationsStatus && messagesStatus) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("reportStatus", reportStatus);
      params.set("recommendationsStatus", recommendationsStatus);
      params.set("messagesStatus", messagesStatus);
      router.replace(`/onboarding/setup?${params.toString()}`, { scroll: false });
    }
  }, [reportStatus, recommendationsStatus, messagesStatus, router, searchParams]);

  // Fire fetch_historical_messages_complete when messagesStatus transitions to completed
  useEffect(() => {
    if (messagesStatus === "completed" && !eventFiredRef.current.fetchHistoricalMessages) {
      posthog.capture?.("fetch_historical_messages_complete", {
        userId: user?.id || null,
        communityId: communityId || null,
      });
      eventFiredRef.current.fetchHistoricalMessages = true;
    }
  }, [messagesStatus, user?.id, communityId]);

  // Fire reward_recommendations_generated when recommendationsStatus transitions to completed
  useEffect(() => {
    if (recommendationsStatus === "completed" && !eventFiredRef.current.rewardRecommendations) {
      posthog.capture?.("reward_recommendations_generated", {
        userId: user?.id || null,
        communityId: communityId || null,
      });
      eventFiredRef.current.rewardRecommendations = true;
    }
  }, [recommendationsStatus, user?.id, communityId]);

  // Fire community_snapshot_generated when reportStatus transitions to completed
  useEffect(() => {
    if (reportStatus === "completed" && !eventFiredRef.current.communitySnapshot) {
      posthog.capture?.("community_snapshot_generated", {
        userId: user?.id || null,
        communityId: communityId || null,
      });
      eventFiredRef.current.communitySnapshot = true;
    }
  }, [reportStatus, user?.id, communityId]);

  return (
    <>
      <div className="mb-8">
        <OnboardingProgressBar steps={progressSteps} progresses={progresses} />
      </div>
      <div className="w-full max-w-2xl bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-800">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col items-center mb-4">
            <CheckCircle className="h-12 w-12 text-yellow-400 mb-2" />
            <h2 className="text-2xl font-bold text-white mb-1">
              {isComplete ? "Setup Complete!" : "Setting up your Copilot"}
            </h2>
            <p className="text-gray-400 text-center max-w-md">
              {isComplete
                ? "Your community Copilot is now ready to help you grow your community."
                : "Your community is now collecting insights. Large communities may take up to 10 minutes to setup."}
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {statusSteps.map((step) => (
              <div
                key={step.key}
                className={`flex items-start gap-4 rounded-xl border border-zinc-800 px-5 py-4 ${
                  step.status === "completed"
                    ? "opacity-100"
                    : step.status === "failed"
                      ? "border-red-500"
                      : "opacity-90"
                }`}
              >
                <div className="flex-shrink-0 mt-1">{getStatusIcon(step.status)}</div>
                <div className="flex-1">
                  <div className="font-semibold text-white mb-0.5">{step.title}</div>
                  <div className="text-gray-400 text-sm mb-1">{step.description}</div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {step.isJob
                        ? getStatusText(step.status)
                        : step.status === "completed"
                          ? "Completed"
                          : "In progress"}
                    </div>
                    {step.isJob && step.status === "failed" && (
                      <Button
                        onClick={() =>
                          handleRetry(
                            step.key === "insights"
                              ? "recommendations"
                              : step.key === "messages"
                                ? "messages"
                                : "report",
                          )
                        }
                      >
                        {t("retry")}
                      </Button>
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
                  {whatsNext.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-gray-300 text-sm">
                      <CheckCircle className="h-4 w-4 text-yellow-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-end mt-6">
                <Button
                  className="rounded-lg bg-yellow-400 text-black font-semibold py-2 px-6 shadow hover:bg-yellow-300 transition-colors duration-150"
                  onClick={() => {
                    posthog.capture?.("onboarding_completed", {
                      userId: user?.id || null,
                      communityId: searchParams.get("communityId") || null,
                    });
                    router.push(`/communities/${searchParams.get("communityId")}`);
                  }}
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
      </div>
      <Dialog open={showLowActivityModal}>
        <DialogContent hideCloseButton className="bg-zinc-900 border-zinc-800 text-white">
          <DialogTitle>Not Enough Activity</DialogTitle>
          <DialogDescription>
            There isn't enough activity in this Discord server to generate insights. Please connect
            a more active server. You can check out an example report to see what insights you'll
            get once you connect a server with sufficient activity.
          </DialogDescription>
          <DialogFooter>
            <Button
              className="bg-yellow-400 text-black hover:bg-yellow-300 font-semibold rounded-lg"
              onClick={() => router.push("/onboarding/integrations")}
            >
              Connect new Discord Server
            </Button>
            <Button variant="outline" onClick={() => router.push("/onboarding/example")}>
              View example Insight Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
