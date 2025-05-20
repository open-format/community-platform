import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import IntegrationsClient from "./integrations-client";
import { agentApiClient } from "@/lib/openformat";
import { Info, Loader2 } from "lucide-react";

const MAX_COMMUNITY_POLL_ATTEMPTS = 10;
const POLL_INTERVAL = 2000; // 2 seconds

async function waitForCommunity(guildId: string): Promise<string | null> {
  for (let attempt = 0; attempt < MAX_COMMUNITY_POLL_ATTEMPTS; attempt++) {
    try {
      const response = await agentApiClient.get(`/communities/${guildId}`);
      if (response.data?.id) {
        return response.data.id;
      }
    } catch (error) {
      console.error(`[API] Community poll attempt ${attempt + 1}/${MAX_COMMUNITY_POLL_ATTEMPTS} failed:`, error);
    }
    if (attempt < MAX_COMMUNITY_POLL_ATTEMPTS - 1) {
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
    }
  }
  return null;
}

async function assignRole(guildId: string): Promise<boolean> {
  try {
    await agentApiClient.post(`/discord/roles/assign`, {
      guild_id: guildId,
      role_type: "admin"
    });
    return true;
  } catch (error) {
    console.error("[API] Role assignment failed:", error);
    return false;
  }
}

function LoadingSkeleton() {
  return (
    <div>
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-zinc-800 bg-[#18181b] shadow-sm p-6 flex flex-col justify-between min-h-[180px]"
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
  const guildId = params.guildId as string | undefined;
  const discordConnected = !!guildId;

  let roleAssignmentStatus: 'success' | 'error' | 'pending' = 'pending';
  let communityId: string | undefined;
  
  if (guildId) {
    try {
      const communityIdResult = await waitForCommunity(guildId);
      if (!communityIdResult) {
        throw new Error("Failed to get community ID after max attempts");
      }
      communityId = communityIdResult;

      // const roleAssigned = await assignRole(guildId);
      const roleAssigned = true;
      if (!roleAssigned) {
        throw new Error("Failed to assign role");
      }

      roleAssignmentStatus = 'success';
    } catch (error: any) {
      console.error("[API] Error:", error.response?.data || error.message);
      roleAssignmentStatus = 'error';
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
        <Suspense fallback={<LoadingSkeleton />}>
          <IntegrationsClient 
            discordConnected={discordConnected} 
            communityId={communityId}
            roleAssignmentStatus={roleAssignmentStatus}
          />
        </Suspense>
      </div>
    </div>
  );
} 