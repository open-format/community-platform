"use client";

import PlatformCard from "@/components/onboarding/platform-card";
import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";
import { Database } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import posthog from "posthog-js";

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
  const { user } = usePrivy();
  const guildId = searchParams.get("guildId");
  const error = searchParams.get("error");

  const handleContinue = () => {
    posthog.capture?.("onboarding_continue_clicked", {
      userId: user?.id || null,
      communityId: communityId || null,
    });
    const params = new URLSearchParams({
      guildId: guildId || "",
      communityId: communityId || "",
    });
    router.push(`/onboarding/setup?${params.toString()}`);
  };

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
            className="rounded-lg bg-yellow-400 text-black font-semibold py-2 px-6 shadow hover:bg-yellow-300 transition-colors duration-150"
            onClick={handleContinue}
          >
            {t("continue")}
          </Button>
        </div>
      )}

      {error && (
        <div className="mt-6 flex flex-col items-end gap-4">
          <div className="text-red-400 text-sm">{t("error")}</div>
          <Button onClick={() => router.push("/onboarding/integrations")}>
            {t("retryConnection")}
          </Button>
        </div>
      )}
    </div>
  );
}
