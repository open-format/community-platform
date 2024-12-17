import Accounts from "@/components/accounts";
import Activity from "@/components/activity";
import Leaderboard from "@/components/leaderboard";
import ProfileBadgeGrid from "@/components/profile-badge-grid";
import Tiers from "@/components/tiers";
import Wallets from "@/components/wallets";
import { fetchUserProfile, generateLeaderboard } from "@/lib/openformat";
import { getCurrentUser } from "@/lib/privy";
import { formatEther } from "viem";
import Connect from "./connect";

export default async function Profile({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const user = await getCurrentUser();
  const profile = await fetchUserProfile(slug);
  const leaderboard = await generateLeaderboard(slug, profile?.tokenBalances[0].token);

  return (
    <div>
      <div className="flex justify-between items-center py-lg">
        <h1>OpenFormat community profile</h1>
        <Connect />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tiers */}

        {/* @TODO: How do we choose the token that is used for the tiers? */}
        {profile?.tokenBalances[0].balance && (
          <div className="md:col-span-full">
            <Tiers currentPoints={Number(formatEther(BigInt(profile?.tokenBalances[0].balance)))} />
          </div>
        )}

        {/* Leaderboard */}
        <div className="md:col-span-full">
          <Leaderboard data={leaderboard?.data} currentWallet={user?.wallet_address} isLoading={false} />
        </div>

        {/* Accounts */}
        <div>
          <Accounts />
          <Wallets />
        </div>

        {/* Collected Badges */}
        <div>
          <ProfileBadgeGrid badges={profile?.badges} />
        </div>

        {/* Activity (Journey) */}
        {profile?.rewards && <Activity rewards={profile.rewards} />}
      </div>
    </div>
  );
}
