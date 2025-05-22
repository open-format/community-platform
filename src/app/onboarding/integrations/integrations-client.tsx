"use client";

import { Button } from "@/components/ui/button";
import { usePollingJob } from "@/hooks/useJobStatus";
import { Database, Loader2} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import PlatformCard from "@/components/onboarding/platform-card";

const platforms = [
  {
    key: "discord",
    icon: "/icons/discord.svg",
    comingSoon: false,
    connectUrl: "/api/discord/start",
    titleKey: "discord",
    descriptionKey: "discordDesc",
  },
  {
    key: "telegram",
    icon: "/icons/telegram.svg",
    comingSoon: true,
    titleKey: "telegram",
    descriptionKey: "telegramDescComingSoon",
  },
  {
    key: "github",
    icon: "/icons/github.svg",
    comingSoon: true,
    titleKey: "github",
    descriptionKey: "githubDescComingSoon",
  },
  {
    key: "dune",
    icon: Database,
    comingSoon: true,
    titleKey: "dune",
    descriptionKey: "duneDescComingSoon",
  },
];

export default function IntegrationsClient({
  discordConnected,
  communityId,
}: {
  discordConnected: boolean;
  communityId?: string;
}) {
  const t = useTranslations("onboarding.integrations");
  const router = useRouter();
  const searchParams = useSearchParams();
  const guildId = searchParams.get("guildId");
  const error = searchParams.get("error");
  const [reportJobId, setReportJobId] = useState<string | null>(null);
  const [recommendationsJobId, setRecommendationsJobId] = useState<string | null>(null);
  const jobsStartedRef = useRef(false);

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
        startRecommendationsJobAsync?.({ platformId: guildId, communityId }),
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
    router.push("/onboarding/integrations");
  };

  // Loading state is true only while we're waiting for job IDs
  const isLoading = discordConnected && (!reportJobId || !recommendationsJobId);

  return (
    <div>
      <div className="grid gap-6 md:grid-cols-2">
        {platforms.map((platform) => (
          <PlatformCard
            key={platform.key}
            icon={platform.icon}
            comingSoon={platform.comingSoon}
            connectUrl={platform.connectUrl}
            titleKey={platform.titleKey}
            descriptionKey={platform.descriptionKey}
            discordConnected={platform.key === "discord" ? discordConnected : undefined}
          />
        ))}
      </div>

      {/* Show continue button only after connection */}
      {discordConnected && (
        <div className="mt-6 flex justify-end">
          <Button
            className={`
              rounded-lg font-semibold py-2 px-6 shadow transition-colors duration-150
              ${
                isLoading
                  ? "bg-zinc-800 text-gray-400 cursor-not-allowed"
                  : "bg-yellow-400 text-black hover:bg-yellow-300"
              }
            `}
            onClick={() => {
              const params = new URLSearchParams({
                guildId: guildId || "",
                reportJobId: reportJobId || "",
                recommendationsJobId: recommendationsJobId || "",
                communityId: communityId || "",
              });
              router.push(`/onboarding/setup?${params.toString()}`);
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("starting")}
              </div>
            ) : (
              t("continue")
            )}
          </Button>
        </div>
      )}

      {error && (
        <div className="mt-6 flex flex-col items-end gap-4">
          <div className="text-red-400 text-sm">{t("error")}</div>
          <Button onClick={handleRetry}>{t("retryConnection")}</Button>
        </div>
      )}
    </div>
  );
}
