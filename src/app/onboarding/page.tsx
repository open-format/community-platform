// src/app/onboarding/page.tsx

"use client";

import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { useEffect } from "react";

export default function DiscordConnectPage() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const error = searchParams.get("error");

  const { user } = usePrivy();

  if (success) {
    useEffect(() => {
      posthog.capture("discord_connect_success", {
        user_id: user?.id,
      });
    }, [user?.id]);
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
