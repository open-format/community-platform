import type { Address } from "viem";

type Chain = {
  APP_FACTORY_ADDRESS: Address;
};

export const chains: Record<string, Chain> = {
  arbitrumSepolia: {
    APP_FACTORY_ADDRESS: "0x19781Af95cA4E113D5D1412452225D11A84ce992",
  },
};
