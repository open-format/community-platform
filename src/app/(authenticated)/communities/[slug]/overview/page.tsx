import { getCommunity } from "@/app/actions/communities/get";
import Shortcuts from "@/components/shortcuts";

import ImpactReports from "@/components/impact-reports/impact-reports";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight, Award } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function Overview({ params }: { params: Promise<{ slug: string }> }) {
  const t = await getTranslations("overview");
  const slug = (await params).slug as `0x${string}`;
  const community = await getCommunity(slug);

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
      {community?.snapshot ? (
        <ImpactReports report={community?.snapshot?.metadata} />
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-6 max-w-prose mx-auto text-muted-foreground">
          <h1 className="text-2xl font-semibold mb-4">
            Your agent is busy listening in your platforms.
          </h1>
          <p className="mb-4">
            Impact reports and reward recommendations are updated daily. Check back soon or{" "}
            <Link href="/onboarding/example" className="text-primary">
              view an example report
            </Link>{" "}
            to see what to expect.
          </p>
          {isDiscordConnected && (
            <p className="mb-4">
              For Discord, you can either{" "}
              <Link href="/onboarding" className="text-primary">
                connect a new Discord server
              </Link>{" "}
              with more activity or wait for the agent to gather more data.
            </p>
          )}
          {!isDiscordConnected && !isTelegramConnected && (
            <p>
              <Link href="/onboarding" className="text-primary">
                Connect a platform
              </Link>{" "}
              to start generating your impact report.
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
