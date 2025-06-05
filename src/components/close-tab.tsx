"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function CloseTab() {
  const router = useRouter();
  return (
    <Button className="w-fit mx-auto" onClick={() => router.back()}>
      Close
    </Button>
  );
}
