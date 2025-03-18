"use client";

import {useEffect, useState} from "react";
import {usePathname} from "next/navigation";
import {Avatar} from "@/components/ui/avatar";
import {addressSplitter, getAddress} from "@/lib/utils";
import {usePrivy} from "@privy-io/react-auth";
import {CopyIcon, ExternalLink, KeySquare, LogOut} from "lucide-react";
import {useTranslations} from "next-intl";
import {toast} from "sonner";
import {Button} from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {Skeleton} from "./ui/skeleton";
import {useApiKey} from "@/hooks/useApikey";

export default function Profile({
  logoutAction,
}: {
  logoutAction: () => void;
}) {
  const {user, ready, exportWallet, authenticated, login} = usePrivy();
  const t = useTranslations("profile");
  const address = getAddress(user);
  const {generateNewApiKey, apiKey, copyApiKeyToClipboard} = useApiKey();
  const [showCreateApiKey, setShowCreateApiKey] = useState<boolean>(false);
  const pathname = usePathname();

  function copyAddress() {
    navigator.clipboard.writeText(address || "");
    toast.success(t("addressCopied"));
  }

  useEffect(() => {
    if (apiKey) {
      toast.success(t("apiKey.yourNewApiKey", {apiKey}), {
        duration: Number.POSITIVE_INFINITY,
        dismissible: true,
        action: {
          label: <CopyIcon className="h-4 w-4 cursor-copy"/>,
          onClick: () => copyApiKeyToClipboard(),
        },
      });
    }
  }, [apiKey, copyApiKeyToClipboard, t]);

  useEffect(() => {
    if (pathname.includes("communities")) {
      setShowCreateApiKey(true);
    }
  }, [pathname]);

  const exportEnabled = user?.wallet?.walletClientType === "privy";

  if (!ready) {
    return <Skeleton className="h-12 w-12 rounded-full"/>;
  }

  return authenticated ? (
    <DropdownMenu>
      <DropdownMenuTrigger>
        {ready ? (
          <Avatar seed={address || ""}/>
        ) : (
          <Skeleton className="h-12 w-12 rounded-full"/>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={copyAddress} className="font-bold">
          <span>{addressSplitter(address || "")}</span>
          <CopyIcon className="ml-auto"/>
        </DropdownMenuItem>
        <DropdownMenuSeparator/>
        {exportEnabled && (
          <DropdownMenuItem onClick={exportWallet} className="font-bold">
            <span>{t("exportWallet")}</span>
            <ExternalLink className="ml-auto"/>
          </DropdownMenuItem>
        )}
        {exportEnabled && (<DropdownMenuSeparator/>)}
        {
          showCreateApiKey && (
            <DropdownMenuItem className="font-bold" onClick={generateNewApiKey}>
              <span>{t("apiKey.createApiKey")}</span>
              <KeySquare className="ml-auto"/>
            </DropdownMenuItem>
          )
        }
        {showCreateApiKey && (<DropdownMenuSeparator/>)}
        <DropdownMenuItem onClick={logoutAction} className="font-bold">
          <span>{t("logout")}</span>
          <LogOut className="ml-auto"/>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Button onClick={login}>{t("login")}</Button>
  );
}
