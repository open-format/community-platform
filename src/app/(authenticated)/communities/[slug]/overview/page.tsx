import Activity from "@/components/activity";
import Leaderboard from "@/components/leaderboard";
import { fetchCommunity, fetchUserProfile, generateLeaderboard } from "@/lib/openformat";

export default async function Overview({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const profile = await fetchUserProfile(slug);
  const leaderboard = await generateLeaderboard(slug, profile?.tokenBalances[0]?.token?.id);
  const community = await fetchCommunity(slug);

  const theme = {
    backgroundColor: "#FFFFFF",
    color: "#000000",
    borderColor: "#6366F1",
    buttonColor: "#6366F1",
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <Leaderboard theme={theme} data={leaderboard} />
      <Activity rewards={community?.rewards || []} theme={theme} showUserAddress={true} />
    </div>
  );
}
