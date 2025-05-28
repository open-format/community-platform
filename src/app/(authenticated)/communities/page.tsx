import getCommunities from "@/app/actions/communities";
import RefreshButton from "@/components/refresh-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CreateCommunityDialog from "@/dialogs/create-community-dialog";
import CreateCommunityForm from "@/forms/create-community-form";
import { addressSplitter } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function Communities() {
  const t = await getTranslations("communities");
  const { communities, error } = await getCommunities();

  if (error) {
    return redirect("/onboarding");
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
    <Suspense fallback={<div>Loading...</div>}>
      <div className="space-y-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1>{t("title")}</h1>
            <RefreshButton />
          </div>
          <CreateCommunityDialog />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-xl">
        {communities.map((community) => (
          <Link key={community.id} href={`/communities/${community.id}/overview`} prefetch={true}>
            <Card>
              <CardHeader>
                <CardTitle>{community.name}</CardTitle>
                <CardDescription>{community.description}</CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between">
                <p className="text-sm text-gray-500 font-semibold">{community.description}</p>
                <Badge>{addressSplitter(community.id)}</Badge>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </Suspense>
  );
}
