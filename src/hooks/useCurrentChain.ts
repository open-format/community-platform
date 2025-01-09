import { type Chain, type ChainName, chains, getChain } from "@/constants/chains";
import { useChainId } from "wagmi";

export function useCurrentChain(): Chain | null {
  const chainId = useChainId();
  const chainName = Object.keys(chains).find((key) => chains[key as ChainName].id === chainId) as ChainName | undefined;

  return chainName ? getChain(chainName) : null;
}
