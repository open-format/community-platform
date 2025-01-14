import Activity from "@/components/activity";
import Leaderboard from "@/components/leaderboard";
import RefreshButton from "@/components/refresh-button";
import Shortcuts from "@/components/shortcuts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fetchCommunity, generateLeaderboard } from "@/lib/openformat";

export default async function Overview({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug as `0x${string}`;
  const leaderboard = await generateLeaderboard(slug);
  const community = await fetchCommunity(slug);

  if (!community) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-6 max-w-prose mx-auto text-muted-foreground">
        <h1 className="text-5xl font-bold mb-4 text-foreground">We&apos;re sorry 😭</h1>
        <p className="text-muted-foreground mb-4">There was an error loading your community.</p>
        <p>Please double check the URL and try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div>
      <Shortcuts community={community} />
      <Separator className="my-lg" />
      <div className="grid grid-cols-2 gap-4">
        <Card variant="borderless" className="h-full">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl font-bold tracking-tight">Leaderboard</CardTitle>
              <RefreshButton />
            </div>
            <CardDescription>A list of members who have earned the most points in this community.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Leaderboard
              data={leaderboard || []}
              showSocialHandles={community.metadata.show_social_handles}
              metadata={{
                user_label: community.metadata.user_label,
                token_label: community.metadata.token_label,
              }}
            />
          </CardContent>
        </Card>

        <Card variant="borderless">
          <CardHeader>
            <div className="flex items-center gap-2">
              <h1>Activity</h1>
              <RefreshButton />
            </div>
            <CardDescription>A list of the most recent rewards in this community.</CardDescription>
          </CardHeader>
          <CardContent>
            <Activity rewards={community?.rewards || []} showUserAddress={true} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
