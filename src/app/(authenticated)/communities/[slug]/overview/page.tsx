import { getCommunity } from "@/app/actions/communities/get";
import Shortcuts from "@/components/shortcuts";

import ImpactReports from "@/components/impact-reports/impact-reports";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Activity, ArrowRight, Award } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { getCommunityImpactReports } from "@/app/actions/communities/reports";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Discord from "../../../../../../public/icons/discord.svg";
import Github from "../../../../../../public/icons/github.svg";
import Telegram from "../../../../../../public/icons/telegram.svg";
import Image from "next/image";

export default async function Overview({ params }: { params: Promise<{ slug: string }> }) {
  const t = await getTranslations("overview");
  const slug = (await params).slug as `0x${string}`;
  const [community, communityImpactReports]: [Community, ImpactReport[]] = await Promise.all([
    getCommunity(slug),
    getCommunityImpactReports(slug),
  ]);

  if (!community) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-6 max-w-prose mx-auto text-muted-foreground">
        <h1 className="text-5xl font-bold mb-4 text-foreground">{t("error.title")}</h1>
        <p className="text-muted-foreground mb-4">{t("error.message")}</p>
        <p>{t("error.action")}</p>
      </div>
    );
  }

  const isDiscordConnected = community.platformConnections.some(
    (platform) => platform.platformType === "discord",
  );
  const isTelegramConnected = community.platformConnections.some(
    (platform) => platform.platformType === "telegram",
  );

  return (
    <div className="space-y-6">
      {community.recommendations > 0 && (
        <Alert className="border-2">
          <Award className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">
            {community.recommendations} reward recommendations pending
          </AlertTitle>
          <AlertDescription className="mt-2">
            <Link href={`/communities/${slug}/copilot`} className={buttonVariants()}>
              Review now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </AlertDescription>
        </Alert>
      )}
      {communityImpactReports && communityImpactReports.length > 0 ? (
        <Tabs defaultValue="combined-0" className="w-full">
          <TabsList className="space-x-6 bg-transparent">
            {communityImpactReports.filter( r => r.isCombined ).map( (r, idx) => (
                <TabsTrigger className="gap-1 border-gray-400 border text-base data-[state=active]:bg-yellow-300 data-[state=active]:text-black text-white" value={`combined-${idx}`} key={`trc-${r.communityId}`}>
                  All
                </TabsTrigger>
            ))}
            {communityImpactReports.filter( r => !r.isCombined ).map( (r, idx) => (
                <TabsTrigger className="gap-2 border-gray-400 border text-base data-[state=active]:bg-yellow-300 data-[state=active]:text-black  text-white" value={`platform-${idx}`} key={`trp-${r.platformId!}`}>
                  { r.platformType === "discord" ? 
                    <Image src={Discord} alt="Discord" width={20} height={20} /> :
                     r.platformType === "telegram" ?
                      <Image src={Telegram} alt="Telegram" width={20} height={20} /> :
                        <Image src={Github} alt="Github" width={20} height={20} /> }
                    <span>›</span>
                    <span>{r.platformName}</span>
                </TabsTrigger>
            ))}
          </TabsList>
          {communityImpactReports.filter( r => r.isCombined ).map( (r, idx) => (
            <TabsContent value={`combined-${idx}`} key={`tvc-${r.communityId}`}>
              <ImpactReports report={r} />
            </TabsContent>
          ))}
          {communityImpactReports.filter( r => !r.isCombined ).map( (r, idx) => (
            <TabsContent value={`platform-${idx}`} key={`trp-${r.platformId!}`}>
              <ImpactReports report={r} />
            </TabsContent>
          ))}

        </Tabs>
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-6 max-w-prose mx-auto">
          <div className="flex flex-col items-center justify-center gap-3 mb-3">
            <Activity className="h-8 w-8 text-primary animate-pulse" />
            <h2 className="text-3xl font-semibold text-foreground">
              Your Copilot is gathering insights from your community's activity.
            </h2>
          </div>
          <p className="text-lg text-muted-foreground mb-6">
            Impact reports and reward recommendations are updated daily. Check back soon or{" "}
            <Link href="/onboarding/example" className="text-primary hover:underline">
              view an example report
            </Link>{" "}
            to see what to expect.
          </p>
          {isDiscordConnected && (
            <p className="text-muted-foreground mb-4">
              To get more insights, you can{" "}
              <Link href="/onboarding" className="text-primary hover:underline">
                connect another Discord server
              </Link>{" "}
              with higher activity or wait for more data to be gathered.
            </p>
          )}
          {!isDiscordConnected && isTelegramConnected && (
            <p className="text-muted-foreground">
              Want to expand your insights?{" "}
              <Link
                href={`/onboarding/integrations?communityId=${community.id}`}
                className="text-primary hover:underline"
              >
                Connect your Discord server
              </Link>{" "}
              to instantly generate impact reports and reward recommendations!
            </p>
          )}

          {!isDiscordConnected && !isTelegramConnected && (
            <p className="text-muted-foreground">
              <Link href="/onboarding" className="text-primary hover:underline">
                Connect a platform
              </Link>{" "}
              to begin generating your community impact report.
            </p>
          )}
        </div>
      )}
      <div>
        <Shortcuts community={community} />
      </div>
    </div>
  );
}
