"use client";
import { revalidate } from "@/lib/openformat";
import { usePrivy } from "@privy-io/react-auth";
import Cookies from "js-cookie";
import { useTranslations } from "next-intl";
import { startTransition, useEffect, useState } from "react";
import { useBalance, useChainId, useSwitchChain } from "wagmi";
import type { GetBalanceData } from "wagmi/query";
import { ChainName, chains } from "../constants/chains";
import { Badge } from "./ui/badge";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { Skeleton } from "./ui/skeleton";

interface NetworkSelectorProps {
	onValueChange?: (chainName: string) => void;
	callback?: () => void;
	hideIfNotSet?: boolean;
}

export default function NetworkSelector({
	onValueChange,
	callback,
	hideIfNotSet = false,
}: NetworkSelectorProps) {
	const currentChainId = useChainId();
	const { user } = usePrivy();
	const { switchChain } = useSwitchChain();
	const { data: balance, isLoading } = useBalance({
		address: user?.wallet?.address,
	});
	const t = useTranslations("networkSelector");
	const [mounted, setMounted] = useState(false);

	// Add this useEffect to handle client-side mounting
	useEffect(() => {
		setMounted(true);
	}, []);

	// If not mounted yet, return a placeholder with the same dimensions
	if (!mounted) {
		return (
			<div className="h-10 w-full">
				<Skeleton className="h-full w-full" />
			</div>
		);
	}

	function handleChainChange(chainName: string) {
		startTransition(async () => {
			// Set the chain in cookies
			Cookies.set("chainName", chainName);

			// Switch chain
			switchChain({ chainId: chains[chainName as ChainName].id });

			// Optional revalidation
			await revalidate();

			// Call optional callback
			onValueChange?.(chainName);
			callback?.();
		});
	}

	// Find the current chain name based on the chain ID
	const currentChainName = (Object.keys(chains) as ChainName[]).find(
		(chainName) => chains[chainName].id === currentChainId,
	);

	// Separate chains into testnet and mainnet groups
	const testnetChains = Object.entries(chains)
		.filter(([_, chain]) => chain.testnet)
		.map(([chainName, chain]) => ({
			value: chainName,
			label: chain.name,
		}));

	const mainnetChains = Object.entries(chains)
		.filter(([_, chain]) => !chain.testnet)
		.map(([chainName, chain]) => ({
			value: chainName,
			label: chain.name,
		}));

	if (!currentChainName) {
		return <Skeleton className="h-10 w-40 " />;
	}

	if (hideIfNotSet && !Cookies.get("chainName")) {
		return null;
	}

	function BalanceBadge({
		balance,
		chainValue,
	}: { balance: GetBalanceData; chainValue: string }) {
		if (chainValue === ChainName.OPENFORMAT) {
			return (
				<Badge className="hidden md:block bg-green-600">
					{t("gasSponsored")}
				</Badge>
			);
		}

		return (
			<Badge className="hidden md:block">
				{t("balance", {
					amount: Number(balance.formatted).toFixed(6),
					symbol: balance.symbol,
				})}
			</Badge>
		);
	}

	return (
		<Select onValueChange={handleChainChange} value={currentChainName}>
			<SelectTrigger>
				<SelectValue placeholder={t("selectNetwork")} />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel className="font-bold">{t("mainnets")}</SelectLabel>
					{mainnetChains.map((option) => (
						<SelectItem
							key={option.value}
							value={option.value}
							className="flex items-center justify-between"
						>
							<div className="flex items-center space-x-2">
								<p>{option.label}</p>
								{option.value === ChainName.OPENFORMAT ? (
									<BalanceBadge balance={balance!} chainValue={option.value} />
								) : (
									option.value === currentChainName &&
									balance && (
										<BalanceBadge balance={balance} chainValue={option.value} />
									)
								)}
							</div>
						</SelectItem>
					))}
				</SelectGroup>
				<SelectSeparator />
				<SelectGroup>
					<SelectLabel className="font-bold">{t("testnets")}</SelectLabel>
					{testnetChains.map((option) => (
						<SelectItem
							key={option.value}
							value={option.value}
							className="flex items-center justify-between"
						>
							<div className="flex items-center space-x-2">
								<p>{option.label}</p>
								{option.value === ChainName.OPENFORMAT ? (
									<BalanceBadge balance={balance!} chainValue={option.value} />
								) : (
									option.value === currentChainName &&
									balance && (
										<BalanceBadge balance={balance} chainValue={option.value} />
									)
								)}
							</div>
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}
