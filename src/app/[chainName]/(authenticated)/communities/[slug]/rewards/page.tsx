import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RewardsForm from "@/forms/rewards-form";
import { fetchCommunity } from "@/lib/openformat";
import { getTranslations } from 'next-intl/server';

export default async function Rewards({ params }: { params: Promise<{ slug: string }> }) {
  const t = await getTranslations('rewards');
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
      <CardContent>
        <RewardsForm community={community} />
      </CardContent>
    </Card>
  );
}
