import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import BatchRewardsForm from "@/forms/batch-rewards-form";
import { fetchCommunity } from "@/lib/openformat";
import { getTranslations } from 'next-intl/server';

export default async function BatchRewards({ params }: { params: Promise<{ slug: string }> }) {
  const t = await getTranslations('batchRewards');
  const slug = (await params).slug;
  const community = await fetchCommunity(slug);

  if (!community) {
    return <div>{t('notFound')}</div>;
  }

  return (
    <Card variant="borderless">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <BatchRewardsForm community={community} />
    </Card>
  );
}
