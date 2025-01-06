"use client";

import { Avatar } from "@/components/ui/avatar";
import { addressSplitter, getAddress } from "@/lib/utils";
import { useLogout, usePrivy } from "@privy-io/react-auth";
import { CopyIcon, ExternalLink, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";

export default function Profile() {
  const { user, ready, exportWallet } = usePrivy();
  const address = getAddress(user);
  const { logout } = usePrivy();
  const router = useRouter();

  function copyAddress() {
    navigator.clipboard.writeText(user?.wallet?.address || "");
    toast.success("Address copied to clipboard");
  }

  useLogout({
    onSuccess: () => {
      router.push("/auth");
    },
  });

  const exportEnabled = user?.wallet?.walletClientType === "privy";

  return (
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
        <DropdownMenuItem onClick={logout} className="font-bold">
          <span>Logout</span>
          <LogOut className="ml-auto" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
