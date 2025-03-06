"use client";

import { usePrivy } from "@privy-io/react-auth";
import LinkAccounts from "./link-accounts";
import Profile from "./profile-header";
import { useTranslations } from "next-intl";

export default function CommunityProfile() {
  const { logout } = usePrivy();
  const t = useTranslations("community.profile");

  return (
    <div
      className="flex flex-col-reverse items-center gap-4 md:flex-row md:items-center md:justify-between"
      aria-label={t("ariaLabels.profileSection")}
    >
      <LinkAccounts />
      <Profile
        logoutAction={logout}
      />
    </div>
  );
}
