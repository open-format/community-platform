export default async function Overview({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  return <div>Authenticated Overview - {slug}</div>;
}
