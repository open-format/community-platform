"use client";

import { Avatar } from "@/components/ui/avatar";
import { addressSplitter, getAddress } from "@/lib/utils";
import { usePrivy } from "@privy-io/react-auth";
import { CopyIcon, ExternalLink, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";

export default function Profile({ logoutAction }: { logoutAction: () => void }) {
  const { user, ready, exportWallet, authenticated, login } = usePrivy();
  const address = getAddress(user);

  function copyAddress() {
    navigator.clipboard.writeText(address || "");
    toast.success("Address copied to clipboard");
  }

  const exportEnabled = user?.wallet?.walletClientType === "privy";

  if (!ready) {
    return <Skeleton className="h-12 w-12 rounded-full" />;
  }

  return authenticated ? (
    <DropdownMenu>
      <DropdownMenuTrigger>
        {ready ? <Avatar seed={address || ""} /> : <Skeleton className="h-12 w-12 rounded-full" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={copyAddress} className="font-bold">
          <span>{addressSplitter(address || "")}</span>
          <CopyIcon className="ml-auto" />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {exportEnabled && (
          <DropdownMenuItem onClick={exportWallet} className="font-bold">
            <span>Export Wallet</span>
            <ExternalLink className="ml-auto" />
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logoutAction} className="font-bold">
          <span>Logout</span>
          <LogOut className="ml-auto" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Button onClick={login}>Login</Button>
  );
}
