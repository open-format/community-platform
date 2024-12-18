import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CommunityConfigForm from "@/forms/community-config-form";
import { fetchCommunity } from "@/lib/openformat";
import Link from "next/link";

export default async function CommunitySettings({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const community = await fetchCommunity(slug);

  if (!community) {
    return <div>Community not found</div>;
  }

  return (
    <Card variant="borderless">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Community Settings</CardTitle>
          <Link
            className={buttonVariants()}
            href={`/${community.metadata.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Community Page
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <CommunityConfigForm community={community} />
      </CardContent>
    </Card>
  );
}
