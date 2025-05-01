"use client";

import { UserProvider } from "@/contexts/user-context";
import { usePrivy } from "@privy-io/react-auth";

export default function ChainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ready, authenticated, user } = usePrivy();

  if (!ready || !authenticated) {
    return null;
  }

  return <UserProvider value={{ user }}>{children}</UserProvider>;
}
