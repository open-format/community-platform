"use client";

import { addressSplitter } from "@/lib/utils";
import { type User, usePrivy } from "@privy-io/react-auth";
import { CheckIcon, CopyIcon, KeyIcon, Wallet } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

export default function Wallets({ user }: { user: User }) {
  const { exportWallet } = usePrivy();
  const [copied, setCopied] = useState(false);

  if (!user.wallet?.address) return null;

  function handleCopy(value: string) {
    if (!value) return;
    setCopied(true);
    navigator.clipboard.writeText(value);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <ul className="flex flex-col space-y-2">
      <h3>Wallets</h3>

      <li key={user?.wallet?.address}>
        <div className="space-x-2 items-center flex">
          <Wallet />
          <span className="text-sm text-muted-foreground">{addressSplitter(user.wallet.address)}</span>
          <Button
            variant="ghost"
            className="hover:bg-transparent p-0"
            onClick={() => handleCopy(user?.wallet?.address || "")}
          >
            {copied ? (
              <CheckIcon className="w-4 h-4 cursor-pointer text-green-600" />
            ) : (
              <CopyIcon className="w-4 h-4 cursor-pointer" />
            )}
          </Button>
        </div>
      </li>

      <li>
        <div className="space-x-2 items-center flex">
          <KeyIcon />
          <Button
            variant="ghost"
            onClick={exportWallet}
            className="text-sm text-muted-foreground p-0 hover:bg-transparent"
          >
            Export wallet
          </Button>
        </div>
      </li>
    </ul>
  );
}
