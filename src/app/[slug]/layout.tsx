import { fetchCommunity } from "@/lib/openformat";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const t = await getTranslations("community");
  const slug = (await params).slug;
  const community = await fetchCommunity(slug);

  // Use VERCEL_URL in production, fallback to localhost in development
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Generate the OG image URL
  const ogImageUrl =
    community?.metadata?.banner_url ||
    `${baseUrl}/api/og?title=${encodeURIComponent(
      community?.metadata?.title || t("defaultTitle"),
    )}&accent=${encodeURIComponent(community?.metadata?.accent_color || "#6366F1")}`;

  return {
    title: community?.metadata?.title ?? t("defaultTitle"),
    description: community?.metadata?.description ?? t("defaultDescription"),
    openGraph: {
      title: community?.metadata?.title ?? t("defaultTitle"),
      description: community?.metadata?.description ?? t("defaultDescription"),
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: community?.metadata?.title ?? t("defaultTitle"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: community?.metadata?.title ?? t("defaultTitle"),
      description: community?.metadata?.description ?? t("defaultDescription"),
      images: [ogImageUrl],
    },
  };
}

export default async function ProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const community = await fetchCommunity(slug);

  return (
    <div
      className={cn(
        "md:px-24 h-full py-2 min-h-screen bg-background",
        community?.metadata?.dark_mode ? "dark" : "light",
      )}
    >
      {children}
    </div>
  );
}
