import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import CreateCommunityForm from "@/forms/create-community";
import { fetchAllCommunities } from "@/lib/openformat";
import { addressSplitter } from "@/lib/utils";
import Link from "next/link";

export default async function Communities() {
  const communities = await fetchAllCommunities();

  if (!communities) {
    return <div>No communities found</div>;
  }

  return (
    <div className="space-y-lg">
      <div className="flex justify-between items-center">
        <h1>Your Communities</h1>
        <CreateCommunityForm />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-xl">
        {communities.map((community) => (
          <Link key={community.id} href={`/communities/${community.id}/overview`} prefetch={true}>
            <Card>
              <CardHeader>
                <CardTitle>{community.name}</CardTitle>
                <CardDescription>{community.metadata?.description}</CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between">
                <p className="text-sm text-gray-500 font-semibold">Arbitrum Sepolia</p>
                <Badge>{addressSplitter(community.id)}</Badge>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
