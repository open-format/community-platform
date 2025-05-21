import { getCommunity } from "@/app/actions/communities/get";
import BadgeGrid from "@/components/badge-grid";
import RefreshButton from "@/components/refresh-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateBadgeForm } from "@/forms/create-badge";
import { getTranslations } from "next-intl/server";

export default async function Badges({ params }: { params: Promise<{ slug: string }> }) {
  const t = await getTranslations("badges");
  const slug = (await params).slug;
  const community = await getCommunity(slug);

  if (!community) {
    return <div>{t("notFound")}</div>;
  }

  return (
    <Card variant="borderless">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <h1>{t("title")}</h1>
            <RefreshButton />
          </CardTitle>
          <CreateBadgeForm community={community} />
        </div>
      </CardHeader>
      <CardContent>
        <BadgeGrid badges={community.onchainData?.badges} communityId={community.id} />
      </CardContent>
    </Card>
  );
}
