import Link from "next/link";

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav className="border-b border-gray-200">
        <div className="flex space-x-8 px-4">
          <Link href="overview" className="px-3 py-4 text-sm font-medium text-gray-500 hover:text-gray-700">
            Overview
          </Link>
          <Link href="rewards" className="px-3 py-4 text-sm font-medium text-gray-500 hover:text-gray-700">
            Rewards
          </Link>
          <Link href="badges" className="px-3 py-4 text-sm font-medium text-gray-500 hover:text-gray-700">
            Badges
          </Link>
          <Link href="activity" className="px-3 py-4 text-sm font-medium text-gray-500 hover:text-gray-700">
            Activity
          </Link>
          <Link href="settings" className="px-3 py-4 text-sm font-medium text-gray-500 hover:text-gray-700">
            Settings
          </Link>
        </div>
      </nav>
      {children}
    </div>
  );
}
