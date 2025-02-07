import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTiers } from "@/db/queries/tiers";
import TiersForm from "@/forms/tiers-form";
import { fetchCommunity } from "@/lib/openformat";
import { getTranslations } from 'next-intl/server';

export default async function TiersPage({ params }: { params: Promise<{ slug: string }> }) {
  const t = await getTranslations('tiers');
  const slug = (await params).slug;
  const tiers = await getTiers(slug);
  const community = await fetchCommunity(slug);

  return (
    <Card variant="borderless">
      <CardHeader>
        <CardTitle>{t('teirs')}</CardTitle>
      </CardHeader>
      <CardContent>
        <TiersForm tiers={tiers} communityId={slug} tokenLabel={community?.metadata?.token_label} />
      </CardContent>
    </Card>
  );
}
