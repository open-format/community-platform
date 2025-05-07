import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ chainName: string; slug: string }>;
}

export default async function CommunityPage({ params }: PageProps) {
  const { chainName, slug } = await params;
  redirect(`/${chainName}/communities/${slug}/overview`);
}
