"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserProvider } from "@/contexts/user-context";

export default function ChainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ready, authenticated, login } = usePrivy();
  const router = useRouter();
  const params = useParams();
  const chainName = params?.chainName as string;

  useEffect(() => {
    if (ready && !authenticated) {
      login();
    } else if (ready && authenticated) {
      router.push(`/${chainName}/communities`);
    }
  }, [ready, authenticated, login, router, chainName]);

  if (!ready || !authenticated) {
    return null;
  }

  return <UserProvider>{children}</UserProvider>;
} 