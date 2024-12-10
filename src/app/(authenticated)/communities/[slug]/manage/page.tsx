export default function Manage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  return <div>Authenticated Manage - {slug}</div>;
}
