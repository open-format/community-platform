"use client";

import { type ChainName, chains } from "@/constants/chains";
import { UserProvider } from "@/contexts/user-context";
import { usePrivy } from "@privy-io/react-auth";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { useChainId, useSwitchChain } from "wagmi";

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const { user, ready } = usePrivy();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const currentChainName = params?.chainName as string;
  const targetChain = chains[currentChainName as ChainName];
  const t = useTranslations("chainSelection");

  useEffect(() => {
    if (chainId !== targetChain.id) {
      switchChain({ chainId: targetChain.id });
    }
  }, [chainId, targetChain, switchChain]);

  if (!ready || !user) {
    return null;
  }

  return (
    <UserProvider value={{ user }}>
      <div className="flex-1">{children}</div>
    </UserProvider>
  );
}
