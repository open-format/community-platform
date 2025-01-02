"use client";

import { Avatar } from "@/components/ui/avatar";
import { addressSplitter } from "@/lib/utils";
import { usePrivy } from "@privy-io/react-auth";
import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";
import LinkAccounts from "../app/[slug]/linkAccounts";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";

export default function CommunityProfile() {
  const { user, exportWallet, logout, ready } = usePrivy();

  function copyAddress() {
    navigator.clipboard.writeText(user?.wallet?.address || "");
    toast.success("Address copied to clipboard");
  }

  return (
    <div className="flex flex-col-reverse items-center gap-4 md:flex-row md:items-center md:justify-between">
      <LinkAccounts />
      <DropdownMenu>
        <DropdownMenuTrigger>
          {ready ? <Avatar seed={user?.wallet?.address || ""} /> : <Skeleton className="h-16 w-16 rounded-full" />}
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={copyAddress}>
            {addressSplitter(user?.wallet?.address || "")}
            <CopyIcon className="w-4 h-4" />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={exportWallet}>Export Wallet</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
