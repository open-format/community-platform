"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { Disc, MessageCircle, Github, Database } from "lucide-react";
import posthog from "posthog-js";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

const platforms = [
  {
    key: "discord",
    icon: <Disc className="h-6 w-6" />,
    comingSoon: false,
    connectUrl: "/api/discord/start",
  },
  {
    key: "telegram",
    icon: <MessageCircle className="h-6 w-6" />,
    comingSoon: true,
  },
  {
    key: "github",
    icon: <Github className="h-6 w-6" />,
    comingSoon: true,
  },
  {
    key: "dune",
    icon: <Database className="h-6 w-6" />,
    comingSoon: true,
  },
];

export default function IntegrationsStep({ onNext }: { onNext?: () => void }) {
  const t = useTranslations();
  const [discordConnected, setDiscordConnected] = useState(false);
  const [interestedPlatforms, setInterestedPlatforms] = useState<string[]>([]);
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const error = searchParams.get("error");

  useEffect(() => {
    if (error) {
      toast.error(t("onboarding.integrations.error"));
    }
  }, [error, t]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Intro */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{t("onboarding.integrations.introTitle")}</h1>
          <p className="text-muted-foreground">{t("onboarding.integrations.intro")}</p>
        </div>
        {/* Platform Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {platforms.map((platform) => (
            <Card key={platform.key} className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <CardHeader className="flex flex-row items-center gap-4 p-6 pb-0">
                <div className="rounded-full bg-muted p-2">{platform.icon}</div>
                <div>
                  <CardTitle className="font-semibold tracking-tight text-lg">{t(`onboarding.integrations.${platform.key}`)}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {platform.comingSoon
                      ? t(`onboarding.integrations.${platform.key}DescComingSoon`)
                      : t(`onboarding.integrations.${platform.key}Desc`, { platform: t(`onboarding.integrations.${platform.key}`) })}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardFooter className="flex items-center p-6 pt-0">
                {platform.key === "discord" ? (
                  success ? (
                    <Button className="w-full" disabled>
                      {t("onboarding.integrations.connected")}
                    </Button>
                  ) : (
                    <Link href={platform.connectUrl!} className="w-full">
                      <Button className="w-full">
                        {t("onboarding.integrations.connect")}
                      </Button>
                    </Link>
                  )
                ) : platform.comingSoon ? (
                  <Button
                    variant={interestedPlatforms.includes(platform.key) ? undefined : "outline"}
                    className={`w-full ${interestedPlatforms.includes(platform.key) ? "bg-green-500 text-white hover:bg-green-600" : ""}`}
                    disabled={interestedPlatforms.includes(platform.key)}
                    onClick={() => {
                      posthog.capture("platform_interested", { platform: platform.key });
                      setInterestedPlatforms((prev) => [...prev, platform.key]);
                    }}
                  >
                    {interestedPlatforms.includes(platform.key)
                      ? t("onboarding.integrations.interestRegistered")
                      : t("onboarding.integrations.imInterested")}
                  </Button>
                ) : (
                  discordConnected ? (
                    <Button className="w-full" disabled>
                      {t("onboarding.integrations.connected")}
                    </Button>
                  ) : (
                    <Link href={platform.connectUrl!} className="w-full">
                      <Button
                        className="w-full"
                        onClick={() => {
                          posthog.capture("discord_connect_initiated");
                          // Optionally setDiscordConnected(true) after successful connection
                        }}
                      >
                        {t("onboarding.integrations.connect")}
                      </Button>
                    </Link>
                  )
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
        {/* Continue Button */}
        {onNext && (
          <div className="flex justify-end mt-8">
            <Button onClick={onNext}>{t("onboarding.integrations.continue")}</Button>
          </div>
        )}
      </div>
    </div>
  );
} 