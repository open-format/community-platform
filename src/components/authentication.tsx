"use client";

import { useLogout, usePrivy } from "@privy-io/react-auth";
import { RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export default function Authentication() {
  const { ready, login, user } = usePrivy();
  const router = useRouter();

  useLogout({ onSuccess: () => router.push("/") });

  if (!ready)
    return (
      <div className="flex items-center justify-center h-screen">
        <RotateCw className="h-6 w-6 animate-spin" />
      </div>
    );

  return <div className="flex items-center justify-center">{!user && <Button onClick={login}>Login</Button>}</div>;
}
