import { getCommunity } from "@/app/actions/communities/get";
import { OnboardingProgressBar } from "@/components/onboarding/onboarding-progress";
import { ExternalLinkIcon, Info, Gift, TrendingUp } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Suspense } from "react";
import IntegrationsClient from "./integrations-client";

function LoadingSkeleton() {
  return (
    <div className="w-full max-w-2xl bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-800">
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-zinc-800 shadow-sm p-6 flex flex-col justify-between min-h-[180px]"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-6 w-6 bg-zinc-800 rounded animate-pulse" />
                <div className="h-6 w-24 bg-zinc-800 rounded animate-pulse" />
              </div>
              <div className="h-4 w-48 bg-zinc-800 rounded animate-pulse mb-6" />
            </div>
            <div className="h-10 w-full bg-zinc-800 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function PlatformsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const t = await getTranslations("onboarding");
  const params = await searchParams;
  const communityId = params.communityId as string;
  const community = communityId ? await getCommunity(communityId) : null;

  const discordConnected = !!community?.platformConnections.some(
    (platform) => platform.platformType === "discord",
  );
  const telegramConnected = !!community?.platformConnections.some(
    (platform) => platform.platformType === "telegram",
  );

  const jobsStarted = discordConnected && !params.error;

  const steps = [{ label: "Connect your community" }, { label: "Deploying to community" }];

  let firstBarProgress = 0.33;
  if (discordConnected || telegramConnected) firstBarProgress = 0.66;
  if (jobsStarted) firstBarProgress = 1;
  const progresses = [firstBarProgress, 0];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="mb-8 w-full max-w-2xl">
        <OnboardingProgressBar steps={steps} progresses={progresses} />
      </div>
      {/* Main Card */}
      <div className="w-full max-w-2xl bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-800">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2 text-white">{t("integrations.introTitle")}</h1>
          <p className="text-gray-400">{t("integrations.intro")}</p>
        </div>
        {/* What happens next box */}
        <div className="bg-zinc-800/70 rounded-xl p-6 mb-8 border border-zinc-700">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-5 w-5 text-yellow-300" />
            <span className="font-semibold text-white">{t("integrations.whatHappensNext")}</span>
          </div>
          <div className="space-y-2 text-gray-300 text-sm">
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-primary" />
              <span>{t("integrations.dailyRewards")}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>{t("integrations.weeklyInsights")}</span>
            </div>
          </div>
          <Link
            href="/onboarding/example"
            className="flex text-primary items-center gap-1 text-sm mt-4"
          >
            <ExternalLinkIcon className="h-4 w-4" /> {t("integrations.seeExampleReport")}
          </Link>
        </div>
        <Suspense fallback={<LoadingSkeleton />}>
          <IntegrationsClient
            discordConnected={discordConnected}
            telegramConnected={telegramConnected}
            community={community}
          />
        </Suspense>
      </div>
    </div>
  );
}
