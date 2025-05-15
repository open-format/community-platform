"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { Disc, MessageCircle, Github, Database } from "lucide-react";
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
  jobId: string;
  status: string;
  error?: string;
}

export default function IntegrationsClient({ 
  discordConnected,
  communityId 
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
  const [interested, setInterested] = useState<Record<string, boolean>>({});

  // Report generation job
  const {
    startJob: startReportJob,
    startJobAsync: startReportJobAsync,
    status: reportStatus,
    isLoading: isReportLoading,
  } = usePollingJob({
    startJobEndpoint: "/api/onboarding/start-report-job",
    statusEndpoint: (jobId) => `/api/onboarding/report-job-status?jobId=${jobId}`,
  });

  // Reward recommendations job
  const {
    startJob: startRecommendationsJob,
    startJobAsync: startRecommendationsJobAsync,
    status: recommendationsStatus,
    isLoading: isRecommendationsLoading,
  } = usePollingJob({
    startJobEndpoint: "/api/onboarding/start-recommendations-job",
    statusEndpoint: (jobId) => `/api/onboarding/recommendations-job-status?jobId=${jobId}`,
  });

  const startJobs = useCallback(async () => {
    if (!communityId || jobsStartedRef.current) {
      return;
    }
    try {
      jobsStartedRef.current = true;
      const [reportResponse, recommendationsResponse] = await Promise.all([
        startReportJobAsync({ platformId: guildId || "", communityId }),
        startRecommendationsJobAsync({ platformId: guildId || "", communityId })
      ]);
      if (reportResponse?.jobId) {
        setReportJobId(reportResponse.jobId);
      }
      const recJobId = recommendationsResponse?.jobId || recommendationsResponse?.job_id;
      if (recJobId) {
        setRecommendationsJobId(recJobId);
      }
    } catch (error) {
      console.error("Failed to start jobs:", error);
      toast.error(t("errors.jobStartFailed"));
      jobsStartedRef.current = false;
    }
  }, [communityId, startReportJobAsync, startRecommendationsJobAsync, t, guildId]);

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

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        {platforms.map((platform) => (
          <Card key={platform.key} className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {platform.icon}
                {t(platform.titleKey)}
              </CardTitle>
              <CardDescription>
                {t(platform.descriptionKey)}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              {platform.comingSoon ? (
                <Button
                  className={`w-full ${interested[platform.key] ? "bg-green-500 hover:bg-green-600 text-white" : ""}`}
                  disabled={!!interested[platform.key]}
                  onClick={() => {
                    posthog?.capture?.(`im_interested_${platform.key}`);
                    setInterested((prev) => ({ ...prev, [platform.key]: true }));
                  }}
                >
                  {interested[platform.key] ? t("interested") : t("imInterested")}
                </Button>
              ) : (
                platform.key === "discord" ? (
                  discordConnected ? (
                    <Button className="w-full bg-green-500 hover:bg-green-600 text-white" disabled>
                      {t("connected")}
                    </Button>
                  ) : (
                    <Link href={platform.connectUrl!} className="w-full">
                      <Button
                        className="w-full"
                        onClick={() => {
                          posthog?.capture?.("discord_connect_initiated");
                        }}
                      >
                        {t("connect")}
                      </Button>
                    </Link>
                  )
                ) : (
                  <Link href={platform.connectUrl!} className="w-full">
                    <Button
                      className="w-full"
                      onClick={() => {
                        posthog?.capture?.(`connect_initiated_${platform.key}`);
                      }}
                    >
                      {t("connect")}
                    </Button>
                  </Link>
                )
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      {reportJobId && recommendationsJobId && (
        <div className="mt-6 flex justify-end">
          <Button 
            onClick={() => router.push(`/onboarding/setup?guildId=${guildId}&reportJobId=${reportJobId}&recommendationsJobId=${recommendationsJobId}`)}
          >
            {t("continue")}
          </Button>
        </div>
      )}
    </div>
  );
} 