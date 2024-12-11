"use client";

import { createContext, useContext } from "react";

type UserContextType = {
  user: {
    id: string;
    wallet_address?: string;
  } | null;
};

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ value, children }: { value: UserContextType; children: React.ReactNode }) {
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
