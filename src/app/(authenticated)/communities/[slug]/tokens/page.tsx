import TokenList from "@/components/token-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateTokenForm } from "@/forms/create-token-form";
import { fetchCommunity } from "@/lib/openformat";

export default async function Tokens({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const community = await fetchCommunity(slug);

  if (!community) {
    return <div>Community not found</div>;
  }

  return (
    <Card variant="borderless">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Tokens</CardTitle>
          <CreateTokenForm community={community} />
        </div>
      </CardHeader>
      <CardContent>
        <TokenList tokens={community.tokens} />
      </CardContent>
    </Card>
  );
}
