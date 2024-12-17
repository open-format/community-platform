import Link from "next/link";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav className="border-b border-gray-200">
        <div className="flex space-x-8 px-4">
          <Link href="overview" className="px-3 py-4 text-sm font-medium text-gray-500 hover:text-gray-700">
            Overview
          </Link>
          <Link href="manage" className="px-3 py-4 text-sm font-medium text-gray-500 hover:text-gray-700">
            Manage
          </Link>
          <Link href="activity" className="px-3 py-4 text-sm font-medium text-gray-500 hover:text-gray-700">
            Activity
          </Link>
        </div>
      </nav>
      {children}
    </div>
  );
}
