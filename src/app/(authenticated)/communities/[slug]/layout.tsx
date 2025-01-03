import Link from "next/link";
import type React from "react";
export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav className="border-b border-gray-200 flex flex-col px-4 -m-lg">
        <div className="flex">
          <Link href="overview" className="pr-3 py-4 text-sm text-gray-500 hover:text-gray-700">
            Overview
          </Link>
          <Link href="settings" className="px-3 py-4 text-sm text-gray-500 hover:text-gray-700">
            Commmunity Page
          </Link>
          <Link href="rewards" className="px-3 py-4 text-sm text-gray-500 hover:text-gray-700">
            Rewards
          </Link>
          <Link href="tokens" className="px-3 py-4 text-sm text-gray-500 hover:text-gray-700">
            Tokens
          </Link>
          <Link href="badges" className="px-3 py-4 text-sm text-gray-500 hover:text-gray-700">
            Badges
          </Link>
        </div>
      </nav>
      <main className="m-lg">{children}</main>
    </div>
  );
}
