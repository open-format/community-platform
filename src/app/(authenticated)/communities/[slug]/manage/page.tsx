import BadgeList from "@/components/badge-grid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateBadgeForm } from "@/forms/create-badge";
import RewardsForm from "@/forms/rewards-form";
import { fetchCommunity } from "@/lib/openformat";

export default async function Manage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const community = await fetchCommunity(slug);

  if (!community) {
    return <div>Community not found</div>;
  }

  return (
    <div>
      <h1>Authenticated Manage - {slug}</h1>
      <RewardsForm community={community} />

      <Card>
        <CardHeader>
          <div className="flex justify-between">
            <CardTitle>Badges</CardTitle>
            <CreateBadgeForm community={community} />
          </div>
        </CardHeader>
        <CardContent>
          <BadgeList badges={community.badges} />
        </CardContent>
      </Card>
    </div>
  );
}
