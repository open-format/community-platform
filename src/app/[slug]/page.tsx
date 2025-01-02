import Activity from "@/components/activity";
import CommunityBadges from "@/components/community-badges";
import { CommunityBanner } from "@/components/community-banner";
import CommunityInfo from "@/components/community-info";
import CommunityProfile from "@/components/community-profile";
import Leaderboard from "@/components/leaderboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchCommunity, fetchUserProfile, generateLeaderboard } from "@/lib/openformat";
import { getCurrentUser } from "@/lib/privy";
import { cn } from "@/lib/utils";

export default async function CommunityPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const community = await fetchCommunity(slug);
  const leaderboard = await generateLeaderboard(slug);
  const profile = await fetchUserProfile(slug);
  const user = await getCurrentUser();

  if (!community) {
    return (
      <div className="text-center p-8 rounded-lg bg-muted">
        <h2 className="text-2xl font-semibold mb-2">Well...this is awkward.</h2>
        <p className="text-muted-foreground">
          We couldn&apos;t find a community at this URL. Please verify the address and try again.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "max-w-prose mx-auto space-y-4 p-5 rounded-xl bg-background sticky top-0 ",
        community?.metadata?.dark_mode ? "dark" : "light"
      )}
    >
      {/* Community Profile */}
      <CommunityProfile user={user} />

      {/* Community Banner */}
      <CommunityBanner banner_url={community?.metadata?.banner_url} accent_color={community?.metadata?.accent_color} />

      {/* Community Info */}
      <CommunityInfo title={community?.metadata?.title} description={community?.metadata?.description} />

      {/* Tiers */}
      {community?.tiers && community?.tiers.length > 0 && <Tiers tiers={community?.tiers} currentPoints={25} />}

      <Tabs defaultValue="leaderboard" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="leaderboard" className="w-full">
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="badges" className="w-full">
            Badges
          </TabsTrigger>
          <TabsTrigger value="activity" className="w-full">
            Activity
          </TabsTrigger>
        </TabsList>
        <TabsContent value="leaderboard">
          <Leaderboard
            data={leaderboard}
            metadata={{ user_label: community?.user_label, token_label: community?.token_label }}
          />
        </TabsContent>
        <TabsContent value="badges">
          <CommunityBadges badges={profile?.badges} />
        </TabsContent>
        <TabsContent value="activity">
          <Activity rewards={profile?.rewards} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
