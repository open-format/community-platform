"use client";

import { type ChainName, chains } from "@/constants/chains";
import { UserProvider } from "@/contexts/user-context";
import { usePrivy } from "@privy-io/react-auth";
import { useTranslations } from "next-intl";
import { useParams, useRouter, usePathname } from "next/navigation";
import { type ReactNode, useEffect, useRef } from "react";
import { useChainId, useSwitchChain } from "wagmi";

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const { user, ready } = usePrivy();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const currentChainName = params?.chainName as string;
  const targetChain = chains[currentChainName as ChainName];
  const t = useTranslations("chainSelection");
  const isSwitchingRef = useRef(false);
  const previousChainRef = useRef(currentChainName);

  useEffect(() => {
    if (!ready || !user) return;

    const handleChainChange = async () => {
      // Prevent multiple simultaneous chain switches
      if (isSwitchingRef.current) return;
      
      try {
        isSwitchingRef.current = true;
        
        const needsChainSwitch = chainId !== targetChain.id;
        const chainChanged = previousChainRef.current !== currentChainName;
        
        // Switch chain if needed
        if (needsChainSwitch) {
          await switchChain({ chainId: targetChain.id });
        }

        // Redirect if either the chain was switched or the chain name changed
        if (needsChainSwitch || chainChanged) {
          const pathSegments = pathname.split('/');
          if (pathSegments[2] === 'communities' && pathSegments.length >= 4) {
            router.push(`/${currentChainName}/communities`);
          }
        }
        
        previousChainRef.current = currentChainName;
      } catch (error) {
        console.error('Failed to switch chain:', error);
      } finally {
        isSwitchingRef.current = false;
      }
    };

    handleChainChange();
  }, [currentChainName, chainId, targetChain.id]);

  if (!ready || !user) {
    return null;
  }

  return (
    <UserProvider value={{ user }}>
      <div className="flex-1">{children}</div>
    </UserProvider>
  );
}
