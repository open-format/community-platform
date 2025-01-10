import type { Address } from "viem";
import { type Chain as ViemChain, arbitrumSepolia, aurora } from "viem/chains";

export const turboChain: ViemChain = {
  id: 1313161567,
  name: "TurboChain",
  nativeCurrency: {
    name: "TurboChain",
    symbol: "TURBO",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc-0x4e45415f.aurora-cloud.dev"],
    },
  },
  blockExplorers: {
    default: {
      name: "TurboChain Explorer",
      url: "https://explorer.turbo.aurora.dev",
    },
  },
};

export type Chain = {
  APP_FACTORY_ADDRESS: Address;
  SUBGRAPH_URL: string;
  BLOCK_EXPLORER_URL: string;
  id: number;
  name: string;
  apiChainName: string;
  transactionOverrides?: {
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
  };
};

export enum ChainName {
  ARBITRUM_SEPOLIA = "arbitrumSepolia",
  AURORA = "aurora",
  TURBO = "turbo",
}

export const chains: Record<ChainName, Chain> = {
  arbitrumSepolia: {
    APP_FACTORY_ADDRESS: "0x19781Af95cA4E113D5D1412452225D11A84ce992",
    SUBGRAPH_URL:
      "https://subgraph.satsuma-prod.com/7238a0e24f3c/openformat--330570/open-format-arbitrum-sepolia/version/v0.1.1/api",
    BLOCK_EXPLORER_URL: "https://sepolia.arbiscan.io",
    ...arbitrumSepolia,
    apiChainName: "arbitrum-sepolia",
  },
  aurora: {
    APP_FACTORY_ADDRESS: "0x2eBF7f4572c218217ca01CE2883E3EfF93626a8E",
    SUBGRAPH_URL: "https://api.studio.thegraph.com/query/82634/open-format-aurora/version/latest",
    BLOCK_EXPLORER_URL: "https://aurorascan.io",
    apiChainName: "aurora",
    ...aurora,
  },
  turbo: {
    APP_FACTORY_ADDRESS: "0x7e405FbA4c29B8B05B5ecF97bA664729C34803B8",
    // @TODO: Update to production subgraph when ready
    SUBGRAPH_URL: "https://openformat-turbo-graph-node-staging.fly.dev/subgraphs/name/open-format-local",
    BLOCK_EXPLORER_URL: "https://explorer.turbo.aurora.dev",
    apiChainName: "turbo",
    ...turboChain,
  },
};

export const getChain = (chainName: ChainName): Chain | null => {
  return chains[chainName] || null;
};
