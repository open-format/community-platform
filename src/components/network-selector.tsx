"use client";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSwitchChain } from "wagmi";
import { ChainName, chains } from "../constants/chains";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Skeleton } from "./ui/skeleton";

export default function NetworkSelector() {
  const router = useRouter();
  const [currentChainName, setCurrentChainName] = useState<ChainName | null>(null);
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    const chainName = Cookies.get("chainName") as ChainName;

    if (!chainName) {
      Cookies.set("chainName", ChainName.ARBITRUM_SEPOLIA);
      setCurrentChainName(ChainName.ARBITRUM_SEPOLIA);
    } else {
      setCurrentChainName(chainName);
    }
  }, []);

  function handleChainChange(chainName: string) {
    console.log("chainName", chains[chainName as ChainName].id);
    switchChain({ chainId: chains[chainName as ChainName].id });
    Cookies.set("chainName", chainName);
    router.push("/communities");
  }

  const chainOptions = Object.keys(chains).map((chainName) => ({
    value: chainName,
    label: chains[chainName as ChainName].name,
  }));

  if (!currentChainName) {
    return <Skeleton className="h-10 w-40 " />;
  }

  return (
    <Select onValueChange={handleChainChange} defaultValue={currentChainName}>
      <SelectTrigger>
        <SelectValue placeholder="Select Network" />
      </SelectTrigger>
      <SelectContent>
        {chainOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
