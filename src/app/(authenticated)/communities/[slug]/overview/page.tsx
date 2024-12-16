import { fetchCommunity } from "@/lib/openformat";

export default async function Overview({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const community = await fetchCommunity(slug);

  return <div>{JSON.stringify(community)}</div>;
}
