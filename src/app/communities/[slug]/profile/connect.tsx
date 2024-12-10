"use client";

import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";

export default function Connect() {
  const { login } = usePrivy();
  return <Button onClick={login}>Connect Wallet</Button>;
}
