import { getCommunity } from "@/db";

export default async function ProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const community = await getCommunity(slug);
  return (
    <div className="p-md" style={{ backgroundColor: community?.primary_color }}>
      {children}
    </div>
  );
}
