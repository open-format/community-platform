"use client";

import { openFormatChain, turboChain } from "@/constants/chains";
import config from "@/constants/config";
import { ConfettiProvider } from "@/contexts/confetti-context";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider, createConfig } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { Suspense, useEffect } from "react";
import { arbitrumSepolia, aurora, base, matchain } from "viem/chains";
import { http } from "wagmi";

const chainConfig = createConfig({
	chains: [
		arbitrumSepolia,
		aurora,
		turboChain,
		base,
		matchain,
		openFormatChain,
	],
	transports: {
		[arbitrumSepolia.id]: http(),
		[aurora.id]: http(),
		[turboChain.id]: http(),
		[base.id]: http(),
		[matchain.id]: http(),
		[openFormatChain.id]: http(),
	},
});
const queryClient = new QueryClient();

export default function Providers({
	children,
	messages,
	locale,
}: {
	children: React.ReactNode;
	messages: any;
	locale: string;
}) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="light"
			disableTransitionOnChange
			forcedTheme="dark"
		>
			<NextIntlClientProvider locale={locale} messages={messages}>
				<PrivyProvider
					appId={config.NEXT_PUBLIC_PRIVY_APP_ID as string}
					config={{
						// Create embedded wallets for users who don't have a wallet
						embeddedWallets: {
							createOnLogin: "all-users",
						},
						// @TODO: Issue with embedded wallets on Aurora and turboChain - awaiting Privy support
						supportedChains: [
							arbitrumSepolia,
							aurora,
							turboChain,
							base,
							matchain,
							openFormatChain,
						],
						defaultChain: openFormatChain,

						appearance: {
							walletChainType: "ethereum-only",
							walletList: [
								"metamask",
								"wallet_connect",
								"rainbow",
								"rabby_wallet",
							],
						},
					}}
				>
					<QueryClientProvider client={queryClient}>
						<WagmiProvider config={chainConfig}>
							<PostHogProvider>
								<ConfettiProvider>{children}</ConfettiProvider>
							</PostHogProvider>
						</WagmiProvider>
					</QueryClientProvider>
				</PrivyProvider>
			</NextIntlClientProvider>
		</ThemeProvider>
	);
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
			api_host:
				process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
			person_profiles: "identified_only", // or 'always' to create profiles for anonymous users as well
			capture_pageview: false, // Disable automatic pageview capture, as we capture manually
		});
	}, []);

	return (
		<PHProvider client={posthog}>
			<SuspendedPostHogPageView />
			{children}
		</PHProvider>
	);
}

function PostHogPageView() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const posthog = usePostHog();

	// Track pageviews
	useEffect(() => {
		if (pathname && posthog) {
			let url = window.origin + pathname;
			if (searchParams.toString()) {
				url = `${url}?${searchParams.toString()}`;
			}

			posthog.capture("$pageview", { $current_url: url });
		}
	}, [pathname, searchParams, posthog]);

	return null;
}

// Wrap PostHogPageView in Suspense to avoid the useSearchParams usage above
// from de-opting the whole app into client-side rendering
// See: https://nextjs.org/docs/messages/deopted-into-client-rendering
function SuspendedPostHogPageView() {
	return (
		<Suspense fallback={null}>
			<PostHogPageView />
		</Suspense>
	);
}
