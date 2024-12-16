import type { Address } from "viem";

type Chain = {
  APP_FACTORY_ADDRESS: Address;
  SUBGRAPH_URL: string;
  BLOCK_EXPLORER_URL: string;
};

export const chains: Record<string, Chain> = {
  arbitrumSepolia: {
    APP_FACTORY_ADDRESS: "0x19781Af95cA4E113D5D1412452225D11A84ce992",
    SUBGRAPH_URL:
      "https://subgraph.satsuma-prod.com/7238a0e24f3c/openformat--330570/open-format-arbitrum-sepolia/version/v0.1.1/api",
    BLOCK_EXPLORER_URL: "https://sepolia.arbiscan.io",
  },
};
