"use client";

import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/contexts/user-context";
import { addressSplitter } from "@/lib/utils";
import { useLogout, usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

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

  console.log(user);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="flex items-center space-x-2 m-3 justify-center items-center">
          <Avatar seed={user?.wallet_address} className="h-12 w-12" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <div className="flex flex-col space-y-2 items-center m-3 justify-center">
          <p className="font-bold  text-xs truncate max-w-[250px]">{addressSplitter(user?.wallet_address)}</p>
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Button onClick={logout}>Logout</Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
