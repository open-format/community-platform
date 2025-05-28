import getCommunities from "@/app/actions/communities";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CreateCommunityForm from "@/forms/create-community-form";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

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
  redirect(`/communities/${communities[0].id}/overview`);
}
