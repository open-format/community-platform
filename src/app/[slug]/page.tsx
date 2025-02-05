import Activity from "@/components/activity";
import CommunityBadges from "@/components/community-badges";
import { CommunityBanner } from "@/components/community-banner";
import CommunityInfo from "@/components/community-info";
import CommunityProfile from "@/components/community-profile";
import Leaderboard from "@/components/leaderboard";
import Tiers from "@/components/tiers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchCommunity, fetchUserProfile, generateLeaderboard } from "@/lib/openformat";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { formatEther } from "viem";

export default async function CommunityPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const community = await fetchCommunity(slug);
  const leaderboard = await generateLeaderboard(slug);
  const profile = await fetchUserProfile(slug);

  // community?.metadata.token_to_display
  const currentPoints = profile?.tokenBalances.find(
    (token) => token.token.id === community?.metadata.token_to_display
  )?.balance;

  if (!community) {
    return (
      <div className="text-center min-h-[100vh] flex flex-col items-center justify-center p-12 rounded-lg bg-background text-foreground space-y-8">
        <h2 className="text-4xl md:text-5xl font-bold">
          Community Not Found <span className="inline-block animate-look-around">👀</span>
        </h2>
        <p className="text-xl max-w-2xl">
          We looked, but couldn&apos;t find a community at this URL. Why not claim it before someone else does? 😏
        </p>
        <Link
          href="/auth"
          className="inline-block px-8 py-4 text-lg rounded-lg border hover:bg-foreground/10 transition-colors"
        >
          Create Your Community →
        </Link>
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
      <CommunityProfile />

      {/* Community Banner */}
      <CommunityBanner banner_url={community.metadata.banner_url} accent_color={community.metadata.accent_color} />

      {/* Community Info */}
      <CommunityInfo title={community?.metadata?.title} description={community?.metadata?.description} />

      {/* Tiers */}
      {community.metadata.tiers && community.metadata.tiers.length > 0 && currentPoints && (
        <Tiers
          tiers={community?.metadata?.tiers}
          currentPoints={Number(formatEther(BigInt(currentPoints)))}
          tokenLabel={community?.metadata?.token_label}
        />
      )}

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
            data={leaderboard || []}
            metadata={{ user_label: community?.metadata?.user_label, token_label: community?.metadata?.token_label }}
            showSocialHandles={community?.metadata?.show_social_handles}
          />
        </TabsContent>
        <TabsContent value="badges">
          <CommunityBadges badges={profile?.badges || community.badges} />
        </TabsContent>
        <TabsContent value="activity">
          <Activity rewards={profile?.rewards} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
