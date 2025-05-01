import type { Address } from "viem";
import { type Chain as ViemChain, arbitrumSepolia, aurora, base, matchain } from "viem/chains";

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

export const openFormatChain = {
  id: 1313161576,
  name: "OpenFormat",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc-0x4e454168.aurora-cloud.dev"],
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
  testnet: boolean;
  subgraph_max_first: number;
  subgraph_max_skip: number;
};

export enum ChainName {
  ARBITRUM_SEPOLIA = "arbitrumSepolia",
  AURORA = "aurora",
  TURBO = "turbo",
  BASE = "base",
  MATCHAIN = "matchain",
  OPENFORMAT = "openFormat",
}

export const chains: Record<ChainName, Chain> = {
  openFormat: {
    APP_FACTORY_ADDRESS: "0x20A9FB49618a10fD7ea79C82ac4e6D9345CB4C97",
    SUBGRAPH_URL: "https://openformat-graph-node.fly.dev/subgraphs/name/open-format-openformat",
    BLOCK_EXPLORER_URL: "https://explorer.0x4e454168.aurora-cloud.dev",
    ...openFormatChain,
    apiChainName: "openformat",
    subgraph_max_first: 1000,
    subgraph_max_skip: 5000,
    testnet: false,
  },
  arbitrumSepolia: {
    APP_FACTORY_ADDRESS: "0x19781Af95cA4E113D5D1412452225D11A84ce992",
    SUBGRAPH_URL:
      "https://api.studio.thegraph.com/query/82634/open-format-arbitrum-sepolia/version/latest",
    BLOCK_EXPLORER_URL: "https://sepolia.arbiscan.io",
    ...arbitrumSepolia,
    apiChainName: "arbitrum-sepolia",
    testnet: true,
    subgraph_max_first: 1000,
    subgraph_max_skip: 5000,
  },
  aurora: {
    APP_FACTORY_ADDRESS: "0x2eBF7f4572c218217ca01CE2883E3EfF93626a8E",
    SUBGRAPH_URL: "https://api.studio.thegraph.com/query/82634/open-format-aurora/version/latest",
    BLOCK_EXPLORER_URL: "https://explorer.aurora.dev",
    apiChainName: "aurora",
    ...aurora,
    testnet: false,
    subgraph_max_first: 1000,
    subgraph_max_skip: 5000,
  },
  turbo: {
    APP_FACTORY_ADDRESS: "0x7e405FbA4c29B8B05B5ecF97bA664729C34803B8",
    // @TODO: Update to production subgraph when ready
    SUBGRAPH_URL:
      "https://openformat-turbo-graph-node-staging.fly.dev/subgraphs/name/open-format-local",
    BLOCK_EXPLORER_URL: "https://explorer.turbo.aurora.dev",
    apiChainName: "turbo",
    ...turboChain,
    testnet: false,
    subgraph_max_first: 1000,
    subgraph_max_skip: -1,
  },
  base: {
    APP_FACTORY_ADDRESS: "0x2d6f1620b263Ce71862Fa95f6fEAbB6A366478cC",
    SUBGRAPH_URL: "https://api.studio.thegraph.com/query/82634/open-format-base/version/latest",
    BLOCK_EXPLORER_URL: "https://base.blockscout.com",
    apiChainName: "base",
    ...base,
    testnet: false,
    subgraph_max_first: 1000,
    subgraph_max_skip: 5000,
  },
  matchain: {
    APP_FACTORY_ADDRESS: "0xf1811D1D6D9a718312c3c9466D8c4a2601f973e7",
    SUBGRAPH_URL:
      "https://subgraph.mobula.io/subgraphs/id/QmZa1CpWzSWiVTftZGMrFbyboHgW49j56h22vCd5fdmgVU",
    BLOCK_EXPLORER_URL: "https://matchscan.io/",
    apiChainName: "matchain",
    ...matchain,
    testnet: false,
    subgraph_max_first: 1000,
    subgraph_max_skip: 5000,
  },
};

export const getChain = (chainName: ChainName): Chain | null => {
  return chains[chainName] || null;
};

export const getChainById = (chainId: number): Chain | null => {
  return Object.values(chains).find((chain) => chain.id === chainId) || null;
};
