import { redirect } from "next/navigation";

export default async function CommunityPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;

  redirect(`/communities/${slug}/overview`);
}
