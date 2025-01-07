"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Logout() {
  const router = useRouter();
  const { logout } = usePrivy();

  useEffect(() => {
    logout();
    router.push("/auth");
  }, [logout]);
  return <div>Logging out...</div>;
}
