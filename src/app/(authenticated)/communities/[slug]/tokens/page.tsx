import RefreshButton from "@/components/refresh-button";
import { TokenVisibilityManager } from "@/components/token-visibility-manager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateTokenForm } from "@/forms/create-token-form";
import { fetchCommunity } from "@/lib/openformat";
import { getTranslations } from 'next-intl/server';

export default async function Tokens({ params }: { params: Promise<{ slug: string }> }) {
  const t = await getTranslations('tokens');
  const slug = (await params).slug;
  const community = await fetchCommunity(slug);

  if (!community) {
    return <div>{t('notFound')}</div>;
  }

  return (
    <Card variant="borderless">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <h1>{t('title')}</h1>
            <RefreshButton />
          </CardTitle>
          <CreateTokenForm community={community} />
        </div>
      </CardHeader>
      <CardContent>
        <TokenVisibilityManager 
          tokens={community.tokens} 
          communityId={community.id} 
          hiddenTokens={community.metadata.hidden_tokens || []} 
        />
      </CardContent>
    </Card>
  );
}