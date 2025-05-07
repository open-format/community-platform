import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CommunitySettingsForm from "@/forms/community-settings-form";
import { fetchCommunity, fetchUserProfile, generateLeaderboard } from "@/lib/openformat";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { getTranslations } from 'next-intl/server';

export default async function CommunitySettings({ params }: { params: Promise<{ slug: string; chainName: string }> }) {
  const t = await getTranslations('settings');
  const { slug, chainName } = await params;
  const community = await fetchCommunity(slug);
  const leaderboard = await generateLeaderboard(slug);
  const profile = await fetchUserProfile(slug);

  if (!community) {
    return <div>{t('notFound')}</div>;
  }

  return (
    <Card variant="borderless">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </div>
          <Link
            className={cn(buttonVariants(), "mx-24")}
            href={`/${chainName}/${community?.metadata?.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('viewPage')}
            <ExternalLink className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <CommunitySettingsForm community={community} leaderboard={leaderboard} badges={profile?.badges} />
      </CardContent>
    </Card>
  );
}
