export default async function Activity({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  return <div>Authenticated Activity - {slug}</div>;
}
