"use client";

import { UserProvider } from "@/contexts/user-context";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ChainSwitcher } from "@/components/chain-switcher";
import { chains, type ChainName } from "@/constants/chains";
import { useChainId, useSwitchChain } from "wagmi";
import { toast } from "sonner";

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const { user, ready } = usePrivy();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [isSwitching, setIsSwitching] = useState(false);
  const currentChainName = params?.chainName as string;
  const targetChain = chains[currentChainName as ChainName];

  useEffect(() => {
    if (ready && !user) {
      router.push("/");
    }
  }, [ready, user, router]);

  useEffect(() => {
    const switchToTargetChain = async () => {
      console.log("=== Layout Chain Switch Debug ===");
      console.log("Current chain ID:", chainId);
      console.log("Target chain:", targetChain?.name);
      console.log("Target chain ID:", targetChain?.id);
      console.log("Current chain name:", currentChainName);

      if (!targetChain || !chainId) {
        console.log("No target chain or chain ID available");
        return;
      }

      // If we're already on the target chain, no need to switch
      if (chainId === targetChain.id) {
        console.log("Already on correct chain");
        setIsSwitching(false);
        return;
      }

      console.log("Chain mismatch - attempting to switch");
      setIsSwitching(true);
      try {
        await switchChain({ chainId: targetChain.id });
        console.log("Chain switch initiated");
        // Wait for chain switch to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log("Chain switch completed");
      } catch (error) {
        console.error("Chain switch error:", error);
        toast.error(`Failed to switch to ${targetChain.name}. Please try again.`);
        // If switch fails, redirect to root
        router.push('/');
      } finally {
        setIsSwitching(false);
      }
    };

    switchToTargetChain();
  }, [chainId, targetChain, switchChain, router, currentChainName]);

  if (!ready || !user) {
    return null;
  }

  if (isSwitching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Switching Chains</h2>
          <p className="text-muted-foreground">Please wait while we switch to {targetChain?.name}...</p>
        </div>
      </div>
    );
  }

  return (
    <UserProvider value={{ user }}>
      <ChainSwitcher 
        onChainMismatch={() => {
          console.log("=== Chain Switcher Mismatch Debug ===");
          console.log("Current chain ID:", chainId);
          const walletChainName = Object.entries(chains).find(
            ([_, chain]) => chain.id === chainId
          )?.[0] as ChainName | undefined;
          console.log("Wallet chain name:", walletChainName);
          console.log("Current chain name:", currentChainName);

          if (walletChainName && walletChainName !== currentChainName) {
            console.log("Redirecting to:", `/${walletChainName}/communities`);
            router.push(`/${walletChainName}/communities`);
          }
        }}
      />
      <div className="flex-1">{children}</div>
    </UserProvider>
  );
}
