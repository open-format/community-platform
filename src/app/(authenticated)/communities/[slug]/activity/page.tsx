export default async function Activity({ params }: { params: { slug: string } }) {
  const { slug } = params;
  return <div>Authenticated Activity - {slug}</div>;
}
