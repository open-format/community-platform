"use client";

import LinkAccounts from "../app/[slug]/linkAccounts";
import Profile from "./profile-header";

export default function CommunityProfile() {
  return (
    <div className="flex flex-col-reverse items-center gap-4 md:flex-row md:items-center md:justify-between">
      <LinkAccounts />
      <Profile />
    </div>
  );
}
