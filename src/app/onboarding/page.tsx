// src/app/onboarding/page.tsx

"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function DiscordConnectPage() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const error = searchParams.get("error");

  if (success) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <h1 className="text-2xl mb-4">Success</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <h1 className="text-2xl mb-4">Error</h1>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-2xl mb-4">Connect Discord</h1>
      <Link href="/api/discord/start">
        <Button>Connect Discord!</Button>
      </Link>
    </div>
  );
}
