import { redirect } from "next/navigation";

export default async function ChainPage({ params }: { params: Promise<{ chainName: string }> }) {
  const chainName = (await params).chainName;
  redirect(`/${chainName}/communities`);
}
