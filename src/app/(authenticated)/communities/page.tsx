import getCommunities from "@/app/actions/communities";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function Communities() {
  const t = await getTranslations("communities");
  const { communities, error } = await getCommunities();

  if (error || !communities || communities.length === 0) {
    return redirect("/onboarding");
  }

  redirect(`/communities/${communities[0].id}/overview`);
}
