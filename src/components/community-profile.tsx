"use client";

import { usePrivy } from "@privy-io/react-auth";
import LinkAccounts from "./link-accounts";
import Profile from "./profile-header";

export default function CommunityProfile() {
  const { logout } = usePrivy();

  return (
    <div className="flex flex-col-reverse items-center gap-4 md:flex-row md:items-center md:justify-between">
      <LinkAccounts />
      <Profile logoutAction={logout} />
    </div>
  );
}
