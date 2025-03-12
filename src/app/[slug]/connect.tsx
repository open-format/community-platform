"use client";

import { Button } from "@/components/ui/button";
import { getContrastSafeColor } from "@/lib/utils";
import { usePrivy } from "@privy-io/react-auth";
import { LogOutIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Connect({ theme }: { theme?: Theme }) {
  const { login, logout, authenticated, ready } = usePrivy();
  const t = useTranslations("auth");

  const buttonStyle = {
    backgroundColor: theme?.buttonColor,
    color: theme?.buttonColor ? getContrastSafeColor(theme.buttonColor as string) : undefined,
  };

  if (!ready) return <div></div>;

  return authenticated ? (
    <Button onClick={logout} style={buttonStyle}>
      <LogOutIcon className="h-4 w-4" />
    </Button>
  ) : (
    <Button onClick={login} style={buttonStyle}>
      {t("login")}
    </Button>
  );
}
