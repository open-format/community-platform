"use client";

import { useUser } from "@/contexts/user-context";

export default function SettingsForm() {
  const { user } = useUser();

  return <div>{user?.wallet_address}</div>;
}
