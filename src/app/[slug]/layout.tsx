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
    <div
      className="p-md"
      style={{
        background: community?.background_color
          ? `linear-gradient(to bottom, ${community.background_color}, ${adjustColor(community.background_color, -10)})`
          : undefined,
      }}
    >
      {children}
    </div>
  );
}

// Helper function to darken/lighten hex colors
function adjustColor(color: string, amount: number): string {
  const hex = color.replace("#", "");
  const r = Math.max(Math.min(Number.parseInt(hex.substring(0, 2), 16) + amount, 255), 0);
  const g = Math.max(Math.min(Number.parseInt(hex.substring(2, 4), 16) + amount, 255), 0);
  const b = Math.max(Math.min(Number.parseInt(hex.substring(4, 6), 16) + amount, 255), 0);

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
