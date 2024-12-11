import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { YOUR_COMMUNITIES } from "@/dummy_data";
import CreateCommunityForm from "@/forms/create-community";
import Link from "next/link";

export default function Communities() {
  return (
    <div>
      <div className="flex justify-between items-center">
        <h1>Your Communities</h1>
        <CreateCommunityForm />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {YOUR_COMMUNITIES.map((community) => (
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
