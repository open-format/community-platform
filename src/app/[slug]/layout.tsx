import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getCommunity } from "../actions/communities/get";

export async function generateMetadata({
  params,
}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const t = await getTranslations("community");
  const slug = (await params).slug;
  const community = await getCommunity(slug);

  // Use VERCEL_URL in production, fallback to localhost in development
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Generate the OG image URL
  const ogImageUrl =
    community?.bannerUrl ||
    `${baseUrl}/api/og?title=${encodeURIComponent(
      community?.name || t("defaultTitle"),
    )}&accent=${encodeURIComponent(community?.accentColor || "#6366F1")}`;

  return {
    title: community?.name ?? t("defaultTitle"),
    description: community?.description ?? t("defaultDescription"),
    openGraph: {
      title: community?.name ?? t("defaultTitle"),
      description: community?.description ?? t("defaultDescription"),
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: community?.name ?? t("defaultTitle"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: community?.name ?? t("defaultTitle"),
      description: community?.description ?? t("defaultDescription"),
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
  const community = await getCommunity(slug);

  return (
    <div
      className={cn(
        "md:px-24 h-full py-2 min-h-screen bg-background",
        community?.darkMode ? "dark" : "light",
      )}
    >
      {children}
    </div>
  );
}
