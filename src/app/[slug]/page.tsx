import Activity from "@/components/activity";
import Leaderboard from "@/components/leaderboard";
import ProfileBadgeGrid from "@/components/profile-badge-grid";
import Tiers from "@/components/tiers";
import { getCommunity } from "@/db/queries/communities";
import { fetchUserProfile, generateLeaderboard } from "@/lib/openformat";
import { getCurrentUser } from "@/lib/privy";
import Image from "next/image";
import { formatEther } from "viem";
import Connect from "./connect";
import ProfileComponent from "./profile-component";

export default async function Profile({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const community = await getCommunity(slug);
  const user = await getCurrentUser();
  const profile = await fetchUserProfile(slug);
  const leaderboard = await generateLeaderboard(slug, profile?.tokenBalances[0].token.id);

  const theme = {
    backgroundColor: community?.background_color || "#FFFFFF",
    color: community?.text_color || "#000000",
    borderColor: community?.accent_color || "#6366F1",
    buttonColor: community?.button_color || "#6366F1",
  };

  return (
    <div style={{ color: theme.color }}>
      <div className="flex justify-between items-center py-lg">
        <div className="flex items-center gap-2">
          <div className="relative h-12 min-w-[120px] max-w-[200px]">
            <Image
              src={community?.logo_url || ""}
              alt={community?.title || "Community logo"}
              fill
              className="object-contain rounded-lg"
              priority
              unoptimized={true}
            />
          </div>
        </div>
        <div className="flex flex-col items-center">
          <h1>{community?.title}</h1>
          <h2>{community?.description}</h2>
        </div>
        <Connect style={{ backgroundColor: theme.buttonColor }} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Profile Component */}
        <div className="md:col-span-full">
          <ProfileComponent user={user} theme={theme} />
        </div>

        {/* Tiers */}
        {/* @TODO: How do we choose the token that is used for the tiers? */}
        {profile?.tokenBalances[0].balance && community?.tiers && (
          <div className="md:col-span-full">
            <Tiers
              theme={theme}
              tiers={community.tiers}
              currentPoints={Number(formatEther(BigInt(profile?.tokenBalances[0].balance)))}
            />
          </div>
        )}

        {/* Collected Badges */}
        <div className="md:col-span-full">
          <ProfileBadgeGrid theme={theme} badges={profile?.badges} />
        </div>

        {/* Leaderboard */}
        <div className="md:col-span-2">
          <Leaderboard
            theme={theme}
            data={leaderboard}
            currentWallet={user?.wallet_address}
            isLoading={false}
            showSocialHandles={community?.show_social_handles}
          />
        </div>

        {/* Activity (Journey) */}
        <div className="md:col-span-2">{profile?.rewards && <Activity theme={theme} rewards={profile.rewards} />}</div>
      </div>
    </div>
  );
}
