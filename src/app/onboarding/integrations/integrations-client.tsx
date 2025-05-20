"use client";

import { useTranslations } from "next-intl";
import { Disc, MessageCircle, Github, Database, Loader2 } from "lucide-react";
import posthog from "posthog-js";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { usePollingJob } from "@/hooks/useJobStatus";

const platforms = [
  {
    key: "discord",
    icon: <Disc className="h-6 w-6" />,
    comingSoon: false,
    connectUrl: "/api/discord/start",
    titleKey: "discord",
    descriptionKey: "discordDesc"
  },
  {
    key: "telegram",
    icon: <MessageCircle className="h-6 w-6" />,
    comingSoon: true,
    titleKey: "telegram",
    descriptionKey: "telegramDescComingSoon"
  },
  {
    key: "github",
    icon: <Github className="h-6 w-6" />,
    comingSoon: true,
    titleKey: "github",
    descriptionKey: "githubDescComingSoon"
  },
  {
    key: "dune",
    icon: <Database className="h-6 w-6" />,
    comingSoon: true,
    titleKey: "dune",
    descriptionKey: "duneDescComingSoon"
  },
];

interface JobResponse {
  jobId?: string;
  job_id?: string;
  status: string;
  error?: string;
}

export default function IntegrationsClient({ 
  discordConnected,
  communityId,
  roleAssignmentStatus
}: { 
  discordConnected: boolean;
  communityId?: string;
  roleAssignmentStatus: 'success' | 'error' | 'pending';
}) {
  const t = useTranslations("onboarding.integrations");
  const router = useRouter();
  const searchParams = useSearchParams();
  const guildId = searchParams.get("guildId");
  const error = searchParams.get("error");
  const [reportJobId, setReportJobId] = useState<string | null>(null);
  const [recommendationsJobId, setRecommendationsJobId] = useState<string | null>(null);
  const jobsStartedRef = useRef(false);
  const [interested, setInterested] = useState<Record<string, boolean>>({});

  const { startJobAsync: startReportJobAsync } = usePollingJob({
    startJobEndpoint: "/api/onboarding/start-report-job",
    statusEndpoint: (jobId) => `/api/onboarding/report-job-status?jobId=${jobId}`,
  });

  const { startJobAsync: startRecommendationsJobAsync } = usePollingJob({
    startJobEndpoint: "/api/onboarding/start-recommendations-job",
    statusEndpoint: (jobId) => `/api/onboarding/recommendations-job-status?jobId=${jobId}`,
  });

  const startJobs = useCallback(async () => {
    if (!communityId || !guildId || jobsStartedRef.current) {
      return;
    }
    try {
      jobsStartedRef.current = true;
      const [reportResponse, recommendationsResponse] = await Promise.all([
        startReportJobAsync?.({ platformId: guildId }),
        startRecommendationsJobAsync?.({ platformId: guildId, communityId })
      ]);
      if (reportResponse?.jobId) {
        setReportJobId(reportResponse.jobId);
      }
      if (recommendationsResponse?.job_id) {
        setRecommendationsJobId(recommendationsResponse.job_id);
      }
    } catch (error) {
      console.error("Failed to start jobs:", error);
      toast.error(t("errors.jobStartFailed"));
      jobsStartedRef.current = false;
    }
  }, [communityId, guildId, startReportJobAsync, startRecommendationsJobAsync, t]);

  useEffect(() => {
    if (discordConnected && communityId && !jobsStartedRef.current) {
      startJobs();
    }
  }, [discordConnected, communityId, startJobs]);

  useEffect(() => {
    if (error) {
      toast.error(t("error"));
    }
  }, [error, t]);

  const handleRetry = () => {
    router.push('/onboarding/integrations');
  };

  // Loading state is true only while we're waiting for job IDs and role assignment
  const isLoading = discordConnected && (roleAssignmentStatus === 'pending' || !reportJobId || !recommendationsJobId);

  return (
    <div>
      <div className="grid gap-6 md:grid-cols-2">
        {platforms.map((platform) => (
          <div
            key={platform.key}
            className={
              `rounded-xl border border-zinc-800 bg-[#18181b] shadow-sm p-6 flex flex-col justify-between min-h-[180px] relative transition-colors duration-200` +
              (platform.comingSoon ? ' opacity-80' : '')
            }
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">
                  {platform.icon}
                </span>
                <span className="font-bold text-lg text-white">{t(platform.titleKey)}</span>
                {platform.key === "dune" && (
                  <span className="ml-2 px-2 py-0.5 rounded bg-zinc-700 text-xs text-gray-300 font-semibold">Coming Soon</span>
                )}
              </div>
              <div className="text-gray-400 text-sm mb-6">
                {t(platform.descriptionKey)}
              </div>
            </div>
            <div>
              {platform.comingSoon ? (
                <button
                  className={`w-full rounded-lg font-semibold py-2 px-4 border transition-colors duration-150
                    ${interested[platform.key]
                      ? "bg-green-500 text-white border-green-600 cursor-not-allowed"
                      : "bg-zinc-800 text-gray-400 border-zinc-700 hover:bg-zinc-700"}
                  `}
                  disabled={!!interested[platform.key]}
                  onClick={() => {
                    posthog?.capture && posthog.capture(`im_interested_${platform.key}`);
                    setInterested((prev) => ({ ...prev, [platform.key]: true }));
                  }}
                >
                  {interested[platform.key] ? t("interested") : t("imInterested")}
                </button>
              ) : (
                platform.key === "discord" ? (
                  discordConnected ? (
                    <button className="w-full rounded-lg bg-green-500 text-white font-semibold py-2 px-4 border border-green-600 cursor-not-allowed" disabled>
                      {t("connected")}
                    </button>
                  ) : (
                    <Link href={platform.connectUrl!} className="w-full">
                      <button
                        className="w-full rounded-lg bg-zinc-800 text-gray-200 font-semibold py-2 px-4 border border-zinc-700 hover:bg-zinc-700 transition-colors duration-150"
                        onClick={() => {
                          posthog?.capture && posthog.capture("discord_connect_initiated");
                        }}
                      >
                        {t("connect")}
                      </button>
                    </Link>
                  )
                ) : (
                  <Link href={platform.connectUrl!} className="w-full">
                    <button
                      className="w-full rounded-lg bg-zinc-800 text-gray-200 font-semibold py-2 px-4 border border-zinc-700 hover:bg-zinc-700 transition-colors duration-150"
                      onClick={() => {
                        posthog?.capture && posthog.capture(`connect_initiated_${platform.key}`);
                      }}
                    >
                      {t("connect")}
                    </button>
                  </Link>
                )
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Show continue button only after connection */}
      {discordConnected && (
        <div className="mt-6 flex justify-end">
          <button 
            className={`rounded-lg font-semibold py-2 px-6 shadow transition-colors duration-150 ${
              isLoading 
                ? "bg-zinc-800 text-gray-400 cursor-not-allowed" 
                : "bg-yellow-400 text-black hover:bg-yellow-300"
            }`}
            onClick={() => router.push(`/onboarding/setup?guildId=${guildId}&reportJobId=${reportJobId}&recommendationsJobId=${recommendationsJobId}`)}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {("starting")}
              </div>
            ) : (
              t("continue")
            )}
          </button>
        </div>
      )}

      {roleAssignmentStatus === 'error' && (
        <div className="mt-6 flex flex-col items-end gap-4">
          <div className="text-red-400 text-sm">
            {("role assignment failed")}
          </div>
          <button 
            className="rounded-lg bg-zinc-800 text-white font-semibold py-2 px-6 border border-zinc-700 hover:bg-zinc-700 transition-colors duration-150"
            onClick={handleRetry}
          >
            {("retryConnection")}
          </button>
        </div>
      )}
    </div>
  );
} 