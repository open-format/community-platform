import BadgeGrid from "@/components/badge-grid";
import RefreshButton from "@/components/refresh-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateBadgeForm } from "@/forms/create-badge";
import { fetchCommunity } from "@/lib/openformat";

export default async function Badges({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const community = await fetchCommunity(slug);

  if (!community) {
    return <div>Community not found</div>;
  }

  return (
    <Card variant="borderless">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <h1>Badges</h1>
            <RefreshButton />
          </CardTitle>
          <CreateBadgeForm community={community} />
        </div>
      </CardHeader>
      <CardContent>
        <BadgeGrid badges={community.badges} communityId={community.id} />
      </CardContent>
    </Card>
  );
}
