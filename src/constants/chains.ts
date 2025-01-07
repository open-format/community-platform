import { type Address, parseGwei } from "viem";
import { arbitrumSepolia, aurora } from "viem/chains";

type Chain = {
  APP_FACTORY_ADDRESS: Address;
  SUBGRAPH_URL: string;
  BLOCK_EXPLORER_URL: string;
  id: number;
  name: string;
  transactionOverrides?: {
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
  };
};

export enum ChainName {
  ARBITRUM_SEPOLIA = "arbitrumSepolia",
  AURORA = "aurora",
}

export const chains: Record<ChainName, Chain> = {
  arbitrumSepolia: {
    APP_FACTORY_ADDRESS: "0x19781Af95cA4E113D5D1412452225D11A84ce992",
    SUBGRAPH_URL:
      "https://subgraph.satsuma-prod.com/7238a0e24f3c/openformat--330570/open-format-arbitrum-sepolia/version/v0.1.1/api",
    BLOCK_EXPLORER_URL: "https://sepolia.arbiscan.io",
    ...arbitrumSepolia,
  },
  aurora: {
    APP_FACTORY_ADDRESS: "0x2eBF7f4572c218217ca01CE2883E3EfF93626a8E",
    SUBGRAPH_URL: "https://api.studio.thegraph.com/query/82634/open-format-aurora/version/latest",
    BLOCK_EXPLORER_URL: "https://aurorascan.io",
    ...aurora,
    transactionOverrides: {
      maxFeePerGas: parseGwei("0.07"),
      maxPriorityFeePerGas: parseGwei("0.07"),
    },
  },
};

export const getChain = (chainName: ChainName): Chain | null => {
  return chains[chainName] || null;
};
