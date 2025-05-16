import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import IntegrationsClient from "./integrations-client";
import { agentApiClient } from "@/lib/openformat";
import { redirect } from "next/navigation";
import { Info } from "lucide-react";
import Link from "next/link";

async function waitForCommunity(guildId: string, maxRetries = 10): Promise<string | undefined> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`Attempt ${i + 1} to fetch community for guild:`, {
        guildId,
        url: `/communities/${guildId}`,
        fullUrl: `${agentApiClient.defaults.baseURL}/communities/${guildId}`
      });
      
      const response = await agentApiClient.get(`/communities/${guildId}`);
      console.log("Community fetch response:", {
        status: response.status,
        data: response.data
      });
      
      if (response.data?.id) {
        return response.data.id;
      }
    } catch (error: unknown) {
      console.error(`Attempt ${i + 1} failed to fetch community:`, {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        response: error instanceof Error && 'response' in error ? {
          status: (error as any).response?.status,
          data: (error as any).response?.data
        } : null
      });

      if (error instanceof Error && 'response' in error && (error as any).response?.status !== 404) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  return undefined;
}

export default async function PlatformsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const t = await getTranslations("onboarding");
  const params = await searchParams;
  const guildId = params.guildId as string | undefined;
  const discordConnected = !!guildId;

  let communityId: string | undefined;
  if (guildId) {
    try {
      communityId = await waitForCommunity(guildId);
    } catch (error) {
      console.error("Failed to fetch community after retries:", error);
      redirect("/onboarding/start");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-[#111010]">
      {/* Progress Bar */}
      <div className="w-full max-w-2xl flex items-center gap-4 mb-8 mt-8">
        <div className="flex-1 flex gap-0">
          <div className="h-2 w-1/2 rounded-l bg-yellow-400" />
          <div className="h-2 w-1/2 rounded-r bg-zinc-800" />
        </div>
        {/* Optionally, you can add step indicators here if needed */}
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
            <span className="font-semibold text-white">What happens next</span>
          </div>
          <ul className="list-disc list-inside text-gray-300 text-sm space-y-1 mb-2">
            <li>Monitor activity across your community</li>
            <li>Identify valuable contributions from members</li>
            <li>Generate insights about engagement and sentiment</li>
            <li>Provide recommendations for rewarding top contributors</li>
          </ul>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <IntegrationsClient 
            discordConnected={discordConnected} 
            communityId={communityId}
          />
        </Suspense>
      </div>
    </div>
  );
} 