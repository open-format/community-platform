import { UserProvider } from "@/contexts/user-context";

import { getCurrentUser } from "@/lib/privy";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  return (
    <UserProvider value={{ user }}>
      <div className="flex-1">{children}</div>
    </UserProvider>
  );
}
