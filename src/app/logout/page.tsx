"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Logout() {
  const router = useRouter();
  const { logout } = usePrivy();

  useEffect(() => {
    logout();
    setTimeout(() => {
      router.push("/auth");
    }, 1000);
  }, [logout]);

  return (
    <div className="text-center min-h-[100vh] flex flex-col items-center justify-center p-12 rounded-lg bg-background text-foreground space-y-8">
      <p className="text-4xl md:text-5xl font-bold">Bye Friend! 👋😢</p>
      <p>Hope to see you again soon!</p>
    </div>
  );
}
