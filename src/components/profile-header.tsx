"use client";

import {useEffect, useState} from "react";
import {usePathname} from "next/navigation";
import {Avatar} from "@/components/ui/avatar";
import {addressSplitter, getAddress} from "@/lib/utils";
import {usePrivy} from "@privy-io/react-auth";
import {CopyIcon, ExternalLink, LogOut} from "lucide-react";
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

export default function Profile({
  logoutAction,
}: {
  logoutAction: () => void;
}) {
  const {user, logout} = usePrivy();
  const t = useTranslations();
  const pathname = usePathname();


  const address = getAddress(user);

  const copyAddressToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success(t("profile.addressCopied"));
    }
  };

  const handleLogout = () => {
    logout();
    logoutAction();
  };

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <Skeleton className="h-8 w-8 rounded-full"/>
        <Skeleton className="h-4 w-[100px]"/>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <img
              src={`https://api.dicebear.com/7.x/identicon/svg?seed=${address}`}
              alt="Avatar"
            />
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuItem
          onClick={copyAddressToClipboard}
          className="cursor-pointer"
        >
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {addressSplitter(address)}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email?.address}
            </p>
          </div>
          <CopyIcon className="ml-auto"/>
        </DropdownMenuItem>
        <DropdownMenuSeparator/>
        <DropdownMenuItem asChild>
          <a
            href={`https://polygonscan.com/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer"
          >
            {t("profile.settings")}
            <ExternalLink className="ml-auto"/>
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator/>
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          {t("profile.logout")}
          <LogOut className="ml-auto"/>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
