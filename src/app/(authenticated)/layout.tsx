import { SidebarNav } from "@/components/sidebar-nav";
import { UserProvider } from "@/contexts/user-context";

import { getCurrentUser } from "@/lib/privy";
import { UsersRoundIcon } from "lucide-react";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

const sidebarItems = [
  {
    title: "Communities",
    href: "/communities",
    icon: <UsersRoundIcon />,
  },
];

export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  return (
    <UserProvider value={{ user }}>
      <div className="grid grid-cols-6">
        <SidebarNav items={sidebarItems} />
        <div className="col-span-5">{children}</div>
      </div>
    </UserProvider>
  );
}
