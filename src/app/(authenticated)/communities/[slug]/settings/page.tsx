import { getCommunity } from "@/app/actions/communities/get";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CommunitySettingsForm from "@/forms/community-settings-form";
import { fetchUserProfile, generateLeaderboard } from "@/lib/openformat";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function CommunitySettings({ params }: { params: Promise<{ slug: string }> }) {
  const t = await getTranslations("settings");
  const slug = (await params).slug;
  const community = await getCommunity(slug);

  const leaderboard = await generateLeaderboard(community);
  const profile = await fetchUserProfile(slug);

  if (!community) {
    return <div>{t("notFound")}</div>;
  }

  return (
    <Card variant="borderless">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </div>
          <Link
            className={cn(buttonVariants(), "mx-24")}
            href={`/${community?.metadata?.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("viewPage")}
            <ExternalLink className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <CommunitySettingsForm
          community={community}
          leaderboard={leaderboard}
          badges={profile?.badges}
        />
      </CardContent>
    </Card>
  );
}
