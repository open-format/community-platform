export default function Overview({ params }: { params: { slug: string } }) {
  const { slug } = params;
  return <div>Authenticated Overview - {slug}</div>;
}
