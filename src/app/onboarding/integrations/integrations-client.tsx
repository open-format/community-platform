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
    comingSoon: false,
    connectUrl: "/api/telegram/start",
    titleKey: "telegram",
    descriptionKey: "telegramDesc",
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
  telegramConnected,
  community,
}: {
  discordConnected: boolean;
  telegramConnected: boolean;
  community: Community;
}) {
  const t = useTranslations("onboarding.integrations");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = usePrivy();
  const guildId = searchParams.get("guildId");
  const error = searchParams.get("error");
  const isNew = searchParams.get("isNew") === "true";

  const isConnected = (platform: string) => {
    const connected =
      platform === "discord"
        ? discordConnected
        : platform === "telegram"
          ? telegramConnected
          : false;
    return connected;
  };

  const handleContinue = () => {
    posthog.capture?.("onboarding_continue_clicked", {
      userId: user?.id || null,
      communityId: community.id || null,
    });

    const firstConnection = searchParams.get("firstConnection") === "true";

    // Get Discord guildId from community platform connections
    const discordConnection = community.platformConnections?.find(
      (conn) => conn.platformType === "discord",
    );
    const discordGuildId = discordConnection?.platformId;

    if (isNew || firstConnection) {
      // If it's a new community OR this is the first platform connection, go to setup
      const params = new URLSearchParams({
        guildId: guildId || discordGuildId || "",
        communityId: community.id || "",
      });
      router.push(`/onboarding/setup?${params.toString()}`);
      return;
    }

    // If community already exists and this isn't the first connection, go to overview
    router.push(`/communities/${community.id}/overview`);
  };

  return (
    <div>
      <div className="grid gap-6 md:grid-cols-2">
        {platforms.map((platform) => (
          <PlatformCard
            communityId={community?.id}
            key={platform.key}
            icon={platform.icon}
            comingSoon={platform.comingSoon}
            connectUrl={platform.connectUrl}
            titleKey={platform.titleKey}
            descriptionKey={platform.descriptionKey}
            discordConnected={
              platform.key === "discord" ? isConnected("discord") : undefined
            }
            telegramConnected={
              platform.key === "telegram" ? isConnected("telegram") : undefined
            }
          />
        ))}
      </div>

      {(discordConnected || telegramConnected) && (
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
