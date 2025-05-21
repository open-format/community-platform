"use client";

import { useTranslations } from "next-intl";
import { LucideIcon } from "lucide-react";
import posthog from "posthog-js";
import Link from "next/link";
import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";

interface PlatformCardProps {
  key: string;
  icon: LucideIcon;
  comingSoon: boolean;
  connectUrl?: string;
  titleKey: string;
  descriptionKey: string;
  discordConnected?: boolean;
}

export default function PlatformCard({
  icon: Icon,
  comingSoon,
  connectUrl,
  titleKey,
  descriptionKey,
  discordConnected,
}: PlatformCardProps) {
  const t = useTranslations("onboarding.integrations");
  const [interested, setInterested] = useState(false);
  const { user } = usePrivy();

  const getDiscordConnectUrl = () => {
    return `/api/discord/start?did=${encodeURIComponent(user?.id || '')}`;
  };

  const handleInterested = () => {
    posthog?.capture && posthog.capture(`im_interested_${titleKey}`);
    setInterested(true);
  };

  const handleConnect = () => {
    posthog?.capture && posthog.capture(`connect_initiated_${titleKey}`);
  };

  return (
    <div
      className={
        `rounded-xl border border-zinc-800 bg-[#18181b] shadow-sm p-6 flex flex-col justify-between min-h-[180px] relative transition-colors duration-200` +
        (comingSoon ? ' opacity-80' : '')
      }
    >
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">
            <Icon className="h-6 w-6" />
          </span>
          <span className="font-bold text-lg text-white">{t(titleKey)}</span>
          {titleKey === "dune" && (
            <span className="ml-2 px-2 py-0.5 rounded bg-zinc-700 text-xs text-gray-300 font-semibold">Coming Soon</span>
          )}
        </div>
        <div className="text-gray-400 text-sm mb-6">
          {t(descriptionKey)}
        </div>
      </div>
      <div>
        {comingSoon ? (
          <button
            className={`w-full rounded-lg font-semibold py-2 px-4 border transition-colors duration-150
              ${interested
                ? "bg-green-500 text-white border-green-600 cursor-not-allowed"
                : "bg-zinc-800 text-gray-400 border-zinc-700 hover:bg-zinc-700"}
            `}
            disabled={interested}
            onClick={handleInterested}
          >
            {interested ? t("interested") : t("imInterested")}
          </button>
        ) : (
          titleKey === "discord" ? (
            discordConnected ? (
              <button className="w-full rounded-lg bg-green-500 text-white font-semibold py-2 px-4 border border-green-600 cursor-not-allowed" disabled>
                {t("connected")}
              </button>
            ) : (
              <Link href={getDiscordConnectUrl()} className="w-full">
                <button
                  className="w-full rounded-lg bg-zinc-800 text-gray-200 font-semibold py-2 px-4 border border-zinc-700 hover:bg-zinc-700 transition-colors duration-150"
                  onClick={handleConnect}
                >
                  {t("connect")}
                </button>
              </Link>
            )
          ) : (
            connectUrl && (
              <Link href={connectUrl} className="w-full">
                <button
                  className="w-full rounded-lg bg-zinc-800 text-gray-200 font-semibold py-2 px-4 border border-zinc-700 hover:bg-zinc-700 transition-colors duration-150"
                  onClick={handleConnect}
                >
                  {t("connect")}
                </button>
              </Link>
            )
          )
        )}
      </div>
    </div>
  );
} 