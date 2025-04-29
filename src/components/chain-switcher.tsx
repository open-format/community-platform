"use client";

import { useChainId, useSwitchChain, useAccount } from "wagmi";
import { chains, ChainName } from "@/constants/chains";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export function ChainSwitcher() {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { address, isConnected } = useAccount();
  const params = useParams();
  const router = useRouter();
  const chainName = params?.chainName as ChainName;
  const targetChain = chains[chainName];

  // Handle chain changes from MetaMask
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    const handleChainChanged = (newChainId: string) => {
      console.log("=== Chain Switcher: MetaMask Chain Change ===");
      console.log("New chain ID from MetaMask:", parseInt(newChainId, 16));
      console.log("Current chain ID from wagmi:", chainId);
      console.log("Target chain name:", chainName);
      console.log("Target chain ID:", targetChain?.id);

      const newChainIdNumber = parseInt(newChainId, 16);
      const currentChainName = Object.entries(chains).find(
        ([_, chain]) => chain.id === newChainIdNumber
      )?.[0] as ChainName | undefined;

      console.log("Found chain name for new ID:", currentChainName);

      if (currentChainName) {
        console.log("Redirecting to:", `/${currentChainName}/communities`);
        toast.info(`Switching to ${currentChainName} chain...`);
        router.push(`/${currentChainName}/communities`);
      } else {
        console.log("Unsupported chain detected, redirecting to root");
        toast.error("Unsupported chain detected. Please select a supported chain.");
        router.push('/');
      }
    };

    console.log("=== Chain Switcher: Setting up chain change listener ===");
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      console.log("=== Chain Switcher: Cleaning up chain change listener ===");
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [router, chainId, chainName, targetChain]);

  return null;
} 