export default async function Profile({ params }: { params: { slug: string } }) {
  const { slug } = params;
  return <div>Public Community Page - {slug}</div>;
}
