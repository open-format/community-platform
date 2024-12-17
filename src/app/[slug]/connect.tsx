"use client";

import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";

export default function Connect() {
  const { login, logout, authenticated, ready } = usePrivy();

  if (!ready) return <Button disabled>Loading...</Button>;
  return authenticated ? (
    <Button onClick={logout}>Disconnect Wallet</Button>
  ) : (
    <Button onClick={login}>Connect Wallet</Button>
  );
}
