import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import IntegrationsClient from "./integrations-client";

export default async function PlatformsPage() {
  const t = await getTranslations("onboarding");

// TODO: Fetch real Discord connection status from backend for the current user
  const discordConnected = false; 

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{t("integrations.introTitle")}</h1>
          <p className="text-muted-foreground">{t("integrations.intro")}</p>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <IntegrationsClient discordConnected={discordConnected} />
        </Suspense>
      </div>
    </div>
  );
} 