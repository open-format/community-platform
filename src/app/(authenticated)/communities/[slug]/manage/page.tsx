export default async function Manage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  return <div>Authenticated Manage - {slug}</div>;
}
