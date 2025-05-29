"use client";

import { usePrivy } from "@privy-io/react-auth";
import { Loader2, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import posthog from "posthog-js";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

interface PlatformCardProps {
  key: string;
  icon: LucideIcon | string;
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
  const { user } = usePrivy();
  const [interested, setInterested] = useState(false);

  // Fire connect_success_discord when Discord is connected
  useEffect(() => {
    if (titleKey === "discord" && discordConnected && user?.id) {
      posthog.capture?.("connect_success_discord", {
        userId: user.id,
      });
    }
  }, [titleKey, discordConnected, user?.id]);

  const getDiscordConnectUrl = () => {
    return `/api/discord/start?did=${encodeURIComponent(user?.id)}`;
  };

  const handleInterested = () => {
    posthog?.capture?.("im_interested_platform", {
      platform: titleKey,
      userId: user?.id || null,
    });
    setInterested(true);
    toast.success(t("interestRegisteredDescription", { platform: t(titleKey) }));
  };

  const handleConnect = () => {
    posthog?.capture?.("connect_initiated_platform", {
      platform: titleKey,
      userId: user?.id || null,
    });
  };

  return (
    <div
      className={`rounded-xl border border-zinc-800 shadow-sm p-6 flex flex-col justify-between min-h-[180px] relative transition-colors duration-200 ${
        comingSoon ? "opacity-80" : ""
      }`}
    >
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">
            {typeof Icon === "string" ? (
              <Image src={Icon} alt="" width={24} height={24} />
            ) : (
              <Icon className="h-6 w-6" />
            )}
          </span>
          <span className="font-bold text-lg text-white">{t(titleKey)}</span>
          {comingSoon && (
            <span className="ml-2 px-2 py-0.5 rounded bg-zinc-700 text-xs text-gray-300 font-semibold">
              {titleKey === "telegram" ? "In Next Release" : t("comingSoon")}
            </span>
          )}
        </div>
        <div className="text-gray-400 text-sm mb-6">{t(descriptionKey)}</div>
      </div>
      <div>
        {comingSoon ? (
          <Button
            variant={interested ? "default" : "outline"}
            className="w-full disabled:opacity-100 disabled:cursor-not-allowed"
            disabled={interested}
            onClick={handleInterested}
          >
            {interested ? t("interested") : t("imInterested")}
          </Button>
        ) : titleKey === "discord" ? (
          discordConnected ? (
            user?.id ? (
              <Button variant="success" className="w-full" disabled>
                {t("connected")}
              </Button>
            ) : (
              <Button className="w-full" disabled>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t("connect")}
              </Button>
            )
          ) : user?.id ? (
            <Link href={getDiscordConnectUrl()} className="w-full">
              <Button className="w-full" onClick={handleConnect}>
                {t("connect")}
              </Button>
            </Link>
          ) : (
            <Button disabled>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              {t("connect")}
            </Button>
          )
        ) : (
          connectUrl && (
            <Link href={connectUrl} className="w-full">
              <Button onClick={handleConnect}>{t("connect")}</Button>
            </Link>
          )
        )}
      </div>
    </div>
  );
}
