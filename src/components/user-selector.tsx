"use client";
import { findUserByHandle } from "@/lib/privy";
import { cn } from "@/lib/utils";
import { CheckIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { ControllerRenderProps } from "react-hook-form";
import { isAddress } from "viem";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface UserSelectorProps {
  field: ControllerRenderProps<any, "user">;
}

export default function UserSelector({ field }: UserSelectorProps) {
  const [displayValue, setDisplayValue] = useState<string>(field.value || "");
  const [userState, setUserState] = useState<{
    status: "idle" | "loading" | "exists" | "not_found";
    data: User | null;
  }>({ status: "idle", data: null });

  // @TODO Add more icons when we support more platforms in getUserByHandle
  function renderIcon(type: "discord" | "telegram") {
    if (type === "discord") {
      return <Image src="/icons/discord.svg" alt="Discord" width={20} height={20} />;
    }
    return <Image src="/icons/discord.svg" alt="Telegram" width={20} height={20} />;
  }

  return (
    <div className="flex space-x-2">
      <div className="relative w-full">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
          {userState.data?.type && renderIcon(userState.data.type)}
        </div>
        <Input
          {...field}
          value={displayValue}
          className={cn({ "pl-2xl": userState.data?.type })}
          placeholder="Enter wallet address, discord handle, or telegram handle"
          onChange={(e) => {
            setDisplayValue(e.target.value);
            field.onChange(e.target.value);
            if (userState.status !== "idle") {
              setUserState({ status: "idle", data: null });
            }
            if (isAddress(e.target.value)) {
              setUserState({
                status: "exists",
                data: {
                  wallet: e.target.value,
                  username: e.target.value,
                },
              });
            }
          }}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {userState.status === "exists" && <CheckIcon className="text-green-600" />}
          {userState.status === "not_found" && <XIcon className="text-red-600" />}
        </div>
      </div>
      <Button
        type="button"
        disabled={userState.status === "loading" || isAddress(displayValue)}
        onClick={async () => {
          const handle = displayValue;
          setUserState({ status: "loading", data: null });
          const user = await findUserByHandle(handle);
          if (user) {
            setUserState({ status: "exists", data: user });
            if (user.wallet && user.username) {
              field.onChange(user.wallet);
              setDisplayValue(`${user.username} (${user.wallet})`);
            }
          } else {
            setUserState({ status: "not_found", data: null });
          }
        }}
      >
        {userState.status === "loading" ? "Finding..." : "Find User"}
      </Button>
    </div>
  );
}
