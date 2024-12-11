import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CreateCommunityForm from "@/forms/create-community";
import { fetchAllCommunities } from "@/lib/openformat";
import Link from "next/link";

export default async function Communities() {
  const communities = await fetchAllCommunities();

  if (!communities) {
    return <div>No communities found</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1>Your Communities</h1>
        <CreateCommunityForm />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {communities.map((community) => (
          <Link key={community.id} href={`/communities/${community.id}`}>
            <Card>
              <CardHeader>
                <CardTitle>{community.name}</CardTitle>
                <CardDescription>{community.id}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
