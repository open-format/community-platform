import Accounts from "@/components/accounts";
import Activity from "@/components/activity";
import CollectedBadges from "@/components/collected-badges";
import Leaderboard from "@/components/leaderboard";
import Tiers from "@/components/tiers";
import { CURRENT_WALLET, LEADERBOARD_DATA, PROFILE } from "@/dummy_data";
import Connect from "./connect";

export default async function Profile({ params }: { params: { slug: string } }) {
  const { slug } = params;
  return (
    <div>
      <div className="flex justify-between items-center py-lg">
        <h1>OpenFormat community profile</h1>
        <Connect />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tiers */}
        <div className="md:col-span-full">
          <Tiers />
        </div>

        {/* Leaderboard */}
        <div className="md:col-span-full">
          <Leaderboard data={LEADERBOARD_DATA} currentWallet={CURRENT_WALLET} isLoading={false} />
        </div>

        {/* Accounts */}
        <Accounts />

        {/* Collected Badges */}
        <CollectedBadges profile={PROFILE} />

        {/* Activity (Journey) */}
        <Activity profile={PROFILE} />
      </div>
    </div>
  );
}
