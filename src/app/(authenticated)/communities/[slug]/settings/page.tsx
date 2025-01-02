import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CommunitySettingsForm from "@/forms/community-settings-form";
import { fetchCommunity, generateLeaderboard } from "@/lib/openformat";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

export default async function CommunitySettings({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const community = await fetchCommunity(slug);
  const leaderboard = await generateLeaderboard(slug);

  if (!community) {
    return <div>Community not found</div>;
  }

  return (
    <Card variant="borderless">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Community Page</CardTitle>
            <CardDescription>Here you can configure your public community page.</CardDescription>
          </div>
          <Link
            className={cn(buttonVariants(), "mx-24")}
            href={`/${community?.metadata?.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Community Page
            <ExternalLink className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <CommunitySettingsForm community={community} leaderboard={leaderboard} />
      </CardContent>
    </Card>
  );
}
