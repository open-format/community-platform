import RewardsForm from "@/forms/rewards-form";

export default async function Manage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  return (
    <div>
      <h1>Authenticated Manage - {slug}</h1>
      <RewardsForm />
    </div>
  );
}
