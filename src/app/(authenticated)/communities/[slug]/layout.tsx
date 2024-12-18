import { buttonVariants } from "@/components/ui/button";
import { fetchCommunity } from "@/lib/openformat";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import type React from "react";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const community = await fetchCommunity(slug);

  return (
    <div>
      <nav className="border-b border-gray-200 flex justify-between items-center">
        <div className="flex space-x-sm px-4">
          <Link href="overview" className="px-3 py-4 text-sm text-gray-500 hover:text-gray-700">
            Overview
          </Link>
          <Link href="rewards" className="px-3 py-4 text-sm text-gray-500 hover:text-gray-700">
            Rewards
          </Link>
          <Link href="badges" className="px-3 py-4 text-sm text-gray-500 hover:text-gray-700">
            Badges
          </Link>
          <Link href="activity" className="px-3 py-4 text-sm text-gray-500 hover:text-gray-700">
            Activity
          </Link>
          <Link href="tiers" className="px-3 py-4 text-sm text-gray-500 hover:text-gray-700">
            Tiers
          </Link>
          <Link href="settings" className="px-3 py-4 text-sm text-gray-500 hover:text-gray-700">
            Settings
          </Link>
        </div>
        <Link
          className={buttonVariants()}
          href={`/${community?.metadata.slug}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View Community Page
          <ExternalLink className="w-4 h-4 ml-2" />
        </Link>
      </nav>
      {children}
    </div>
  );
}
