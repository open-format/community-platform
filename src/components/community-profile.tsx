"use client";

import { fundAccount } from "@/lib/openformat";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import type { Address } from "viem";
import LinkAccounts from "./link-accounts";
import Profile from "./profile-header";

export default function CommunityProfile() {
  const { logout } = usePrivy();
  useLogin({
    onComplete: async (user, isNewUser) => {
      if (isNewUser && user.wallet?.address) {
        await fundAccount(user.wallet.address as Address);
      }
    },
  });

  return (
    <div className="flex flex-col-reverse items-center gap-4 md:flex-row md:items-center md:justify-between">
      <LinkAccounts />
      <Profile logoutAction={logout} />
    </div>
  );
}
