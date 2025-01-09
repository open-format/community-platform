"use client";

import { turboChain } from "@/constants/chains";
import config from "@/constants/config";
import { ConfettiProvider } from "@/contexts/confetti-context";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider, createConfig } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { arbitrumSepolia, aurora } from "viem/chains";
import { http } from "wagmi";

const chainConfig = createConfig({
  chains: [arbitrumSepolia, aurora, turboChain],
  transports: {
    [arbitrumSepolia.id]: http(),
    [aurora.id]: http(),
    [turboChain.id]: http(),
  },
});
const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={config.NEXT_PUBLIC_PRIVY_APP_ID as string}
      config={{
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          createOnLogin: "all-users",
        },
        // @TODO: Issue with embedded wallets on Aurora and turboChain - awaiting Privy support
        supportedChains: [arbitrumSepolia, aurora, turboChain],
        defaultChain: arbitrumSepolia,
        appearance: {
          showWalletLoginFirst: true,
          walletChainType: "ethereum-only",
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={chainConfig}>
          <ConfettiProvider>{children}</ConfettiProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
