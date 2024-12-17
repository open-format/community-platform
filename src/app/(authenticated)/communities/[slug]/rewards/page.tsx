import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RewardsForm from "@/forms/rewards-form";
import { fetchCommunity } from "@/lib/openformat";

export default async function Rewards({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const community = await fetchCommunity(slug);

  if (!community) {
    return <div>Community not found</div>;
  }

  return (
    <Card variant="borderless">
      <CardHeader>
        <CardTitle>Rewards</CardTitle>
      </CardHeader>
      <CardContent>
        <RewardsForm community={community} />
      </CardContent>
    </Card>
  );
}
