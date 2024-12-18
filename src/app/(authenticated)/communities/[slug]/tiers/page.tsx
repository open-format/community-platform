import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTiers } from "@/db/queries/tiers";
import TiersForm from "@/forms/tiers-form";

export default async function TiersPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const tiers = await getTiers(slug);

  return (
    <Card variant="borderless">
      <CardHeader>
        <CardTitle>Tiers</CardTitle>
      </CardHeader>
      <CardContent>
        <TiersForm tiers={tiers} communityId={slug} />
      </CardContent>
    </Card>
  );
}
