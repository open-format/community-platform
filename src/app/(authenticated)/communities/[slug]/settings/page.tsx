import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CommunityConfigForm from "@/forms/community-config-form";
import { fetchCommunity } from "@/lib/openformat";

export default async function CommunitySettings({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const community = await fetchCommunity(slug);

  if (!community) {
    return <div>Community not found</div>;
  }

  return (
    <Card variant="borderless">
      <CardHeader>
        <CardTitle>Community Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <CommunityConfigForm community={community} />
      </CardContent>
    </Card>
  );
}
