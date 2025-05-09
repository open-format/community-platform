"use client";

import { turboChain } from "@/constants/chains";
import config from "@/constants/config";
import { ConfettiProvider } from "@/contexts/confetti-context";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider, createConfig } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { arbitrumSepolia, aurora, base, matchain } from "viem/chains";
import { http } from "wagmi";
import { NextIntlClientProvider } from 'next-intl';

const chainConfig = createConfig({
  chains: [arbitrumSepolia, aurora, turboChain, base, matchain],
  transports: {
    [arbitrumSepolia.id]: http(),
    [aurora.id]: http(),
    [turboChain.id]: http(),
    [base.id]: http(),
    [matchain.id]: http(),
  },
});
const queryClient = new QueryClient();

export default function Providers({ 
  children, 
  messages,
  locale 
}: { 
  children: React.ReactNode;
  messages: any;
  locale: string;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <PrivyProvider
        appId={config.NEXT_PUBLIC_PRIVY_APP_ID as string}
        config={{
          // Create embedded wallets for users who don't have a wallet
          embeddedWallets: {
            createOnLogin: "all-users",
          },
          // @TODO: Issue with embedded wallets on Aurora and turboChain - awaiting Privy support
          supportedChains: [arbitrumSepolia, aurora, turboChain, base, matchain],
          defaultChain: arbitrumSepolia,

          appearance: {
            walletChainType: "ethereum-only",
            walletList: ["metamask", "wallet_connect", "rainbow", "rabby_wallet"],
          },
        }}
      >
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={chainConfig}>
            <ConfettiProvider>{children}</ConfettiProvider>
          </WagmiProvider>
        </QueryClientProvider>
      </PrivyProvider>
    </NextIntlClientProvider>
  );
}
