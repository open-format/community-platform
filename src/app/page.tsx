import Authentication from "@/components/authentication";
import Profile from "@/components/profile";
import { getUserProfile } from "@/lib/openformat";

async function fetchUserProfile(user: string) {
  if (!user) return null;

  const data = await getUserProfile(user);

  return data;
}

export default async function Home({ searchParams }: { searchParams: Promise<{ user: string }> }) {
  const userParam = (await searchParams).user;
  const profile = await fetchUserProfile(userParam as string);

  return (
    <div className="flex flex-col items-center justify-center">
      <Authentication />
      <Profile profile={profile} />
    </div>
  );
}
