"use client";

import { Button } from "@/components/ui/button";
import { getContrastSafeColor } from "@/lib/utils";
import { usePrivy } from "@privy-io/react-auth";

export default function Connect({ style }: { style?: React.CSSProperties }) {
  const { login, logout, authenticated, ready } = usePrivy();

  const buttonStyle = {
    ...style,
    color: style?.backgroundColor ? getContrastSafeColor(style.backgroundColor as string) : undefined,
  };

  if (!ready) return <Button disabled>Loading...</Button>;
  return authenticated ? (
    <Button onClick={logout} style={buttonStyle}>
      Disconnect Wallet
    </Button>
  ) : (
    <Button onClick={login} style={buttonStyle}>
      Connect Wallet
    </Button>
  );
}
