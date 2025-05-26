import { getCommunity } from "@/app/actions/communities/get";
import RewardRecommendations from "../overview/components/reward-recommendations";

export default async function CopilotPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const community = await getCommunity(slug);

  return (
    <div className="space-y-4">
      <h1>Reward Recommendations</h1>
      <RewardRecommendations community={community} />
    </div>
  );
}
