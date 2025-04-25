import { redirect } from "next/navigation";

export default async function CommunityPage({ params }: { params: { chainName: string; slug: string } }) {
  redirect(`/${params.chainName}/communities/${params.slug}/overview`);
}
