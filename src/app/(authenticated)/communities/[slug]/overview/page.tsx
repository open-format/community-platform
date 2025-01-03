import Activity from "@/components/activity";
import Leaderboard from "@/components/leaderboard";
import Shortcuts from "@/components/shortcuts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fetchCommunity, generateLeaderboard } from "@/lib/openformat";

export default async function Overview({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const leaderboard = await generateLeaderboard(slug);
  const community = await fetchCommunity(slug);

  const theme = {
    backgroundColor: "#FFFFFF",
    color: "#000000",
    borderColor: "#6366F1",
    buttonColor: "#6366F1",
  };

  return (
    <div>
      <Shortcuts community={community} />
      <Separator className="my-lg" />
      <div className="grid grid-cols-2 gap-4">
        <Card variant="borderless" className="h-full">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold tracking-tight">Leaderboard</CardTitle>
            <CardDescription>A list of members who have earned the most points in this community.</CardDescription>
          </CardHeader>
          <CardContent>
            <Leaderboard theme={theme} data={leaderboard} />
          </CardContent>
        </Card>

        <Card variant="borderless">
          <CardHeader>
            <CardTitle>Activity</CardTitle>
            <CardDescription>A list of the most recent rewards in this community.</CardDescription>
          </CardHeader>
          <CardContent>
            <Activity rewards={community?.rewards || []} theme={theme} showUserAddress={true} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
