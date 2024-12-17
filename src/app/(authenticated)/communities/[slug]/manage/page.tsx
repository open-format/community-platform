import BadgeList from "@/components/badge-grid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CommunityConfigForm from "@/forms/community-config-form";
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
    <div style={{ backgroundColor: community.pageConfiguration.primary_color }}>
      <h1>Authenticated Manage - {slug}</h1>
      <div className="grid grid-cols-2 gap-4">
        {/* Rewards */}
        <RewardsForm community={community} />

        {/* Badges */}
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

        {/* Community Config */}
        <CommunityConfigForm community={community} />
      </div>
    </div>
  );
}
