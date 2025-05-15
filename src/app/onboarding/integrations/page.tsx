import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import IntegrationsClient from "./integrations-client";
import { agentApiClient } from "@/lib/openformat";
import { redirect } from "next/navigation";

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
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{t("integrations.introTitle")}</h1>
          <p className="text-muted-foreground">{t("integrations.intro")}</p>
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