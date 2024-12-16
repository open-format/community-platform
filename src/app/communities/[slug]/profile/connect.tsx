"use client";

import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";

export default function Connect() {
  const { login, logout, authenticated, ready, exportWallet } = usePrivy();

  if (!ready) return <Button disabled>Loading...</Button>;
  return authenticated ? (
    <div>
      <Button onClick={logout}>Disconnect Wallet</Button>
      <Button onClick={exportWallet}>Export Wallet</Button>
    </div>
  ) : (
    <Button onClick={login}>Connect Wallet</Button>
  );
}
