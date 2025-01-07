"use client";

import config from "@/constants/config";
import { ConfettiProvider } from "@/contexts/confetti-context";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider, createConfig } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { arbitrumSepolia, aurora } from "viem/chains";
import { http } from "wagmi";

const queryClient = new QueryClient();

const chainConfig = createConfig({
  chains: [arbitrumSepolia, aurora],
  transports: {
    [arbitrumSepolia.id]: http(),
    [aurora.id]: http(),
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={config.NEXT_PUBLIC_PRIVY_APP_ID as string}
      config={{
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          createOnLogin: "all-users",
        },
        supportedChains: [arbitrumSepolia, aurora],
        defaultChain: arbitrumSepolia,
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
