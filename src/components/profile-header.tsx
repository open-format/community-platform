"use client";

import { Avatar } from "@/components/ui/avatar";
import { useUser } from "@/contexts/user-context";
import { addressSplitter } from "@/lib/utils";
import { useLogout, usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function Profile() {
  const { user } = useUser();
  const { logout } = usePrivy();
  const router = useRouter();

  useLogout({
    onSuccess: () => {
      router.push("/auth");
    },
  });

  if (!user) return null;

  return (
    <div className="flex items-center space-x-2">
      <p className="font-bold text-xs truncate">{addressSplitter(user?.wallet_address, 10)}</p>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar seed={user?.wallet_address} className="h-12 w-12" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <Button variant="ghost" onClick={logout}>
              Account Settings
            </Button>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Button variant="ghost" onClick={logout}>
              Logout
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
