import Accounts from "@/components/accounts";
import Activity from "@/components/activity";
import Leaderboard from "@/components/leaderboard";
import ProfileBadgeGrid from "@/components/profile-badge-grid";
import Tiers from "@/components/tiers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Wallets from "@/components/wallets";
import { getCommunity } from "@/db/queries/communities";
import { fetchUserProfile, generateLeaderboard } from "@/lib/openformat";
import { getCurrentUser } from "@/lib/privy";
import Image from "next/image";
import { formatEther } from "viem";
import Connect from "./connect";

export default async function Profile({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const community = await getCommunity(slug);
  const user = await getCurrentUser();
  const profile = await fetchUserProfile(slug);
  const leaderboard = await generateLeaderboard(slug, profile?.tokenBalances[0].token);

  const theme = {
    backgroundColor: community?.background_color || "#FFFFFF",
    color: community?.text_color || "#000000",
    borderColor: community?.accent_color || "#6366F1",
    buttonColor: community?.button_color || "#6366F1",
  };

  return (
    <div style={theme}>
      <div className="flex justify-between items-center py-lg">
        <div className="flex items-center gap-2">
          <div className="relative h-12 min-w-[120px] max-w-[200px]">
            <Image
              src={community?.logo_url || ""}
              alt={community?.title || "Community logo"}
              fill
              className="object-contain rounded-lg"
              priority
            />
          </div>
          <h1>{community?.title}</h1>
        </div>
        <h2>{community?.description}</h2>
        <Connect style={{ backgroundColor: theme.buttonColor }} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        {/* Leaderboard */}
        <div className="md:col-span-full">
          <Leaderboard theme={theme} data={leaderboard?.data} currentWallet={user?.wallet_address} isLoading={false} />
        </div>

        {/* Accounts */}
        <Card variant="outline" style={theme}>
          <CardHeader>
            <CardTitle>Wallet and Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-md">
            <Accounts />
            <Wallets />
          </CardContent>
        </Card>

        {/* Collected Badges */}
        <div>
          <ProfileBadgeGrid theme={theme} badges={profile?.badges} />
        </div>

        {/* Activity (Journey) */}
        {profile?.rewards && <Activity theme={theme} rewards={profile.rewards} />}
      </div>
    </div>
  );
}
