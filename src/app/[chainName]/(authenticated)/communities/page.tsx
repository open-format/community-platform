import RefreshButton from "@/components/refresh-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import CreateCommunityDialog from "@/dialogs/create-community-dialog";
import CreateCommunityForm from "@/forms/create-community-form";
import { fetchAllCommunities } from "@/lib/openformat";
import { addressSplitter } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { chains, type ChainName } from "@/constants/chains";

interface PageProps {
  params: Promise<{ chainName: string }>;
}

export default async function Communities({ params }: PageProps) {
  const { chainName } = await params;
  const t = await getTranslations("communities");
  const chain = chains[chainName as ChainName];
  
  if (!chain) {
    return (
      <div className="flex flex-col items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Invalid Chain</CardTitle>
            <CardDescription>The selected chain is not supported.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { data: communities, error } = await fetchAllCommunities(chainName);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>{t("errorLoading.title")}</CardTitle>
            <CardDescription>{t("errorLoading.description")}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (communities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>{t("createFirst")}</CardTitle>
            <CardDescription>{t("createDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateCommunityForm />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-lg">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1>{t("title")}</h1>
          <RefreshButton />
        </div>
        <CreateCommunityDialog />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-xl">
        {communities.map((community) => (
          <Link key={community.id} href={`/${chainName}/communities/${community.id}`} prefetch={true}>
            <Card>
              <CardHeader>
                <CardTitle>{community.name}</CardTitle>
                <CardDescription>{community.metadata?.description}</CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between">
                <p className="text-sm text-gray-500 font-semibold">{chain.name}</p>
                <Badge>{addressSplitter(community.id)}</Badge>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
