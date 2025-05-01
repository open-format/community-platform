"use client";

import Profile from "@/components/profile-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChainName, chains } from "@/constants/chains";
import { usePrivy } from "@privy-io/react-auth";
import { ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function ChainSelectionPage() {
  const router = useRouter();
  const { authenticated } = usePrivy();

  const t = useTranslations("chainSelection");

  const handleChainSelect = async (chainName: ChainName) => {
    if (!authenticated) {
      const redirectUrl = encodeURIComponent(`/${chainName}/communities`);
      router.push(`/auth?redirect=${redirectUrl}`);
    } else {
      router.push(`/${chainName}/communities`);
    }
  };

  const handleLogout = () => {
    router.replace("/logout");
  };

  const testnetChains = Object.entries(chains).filter(([_, chain]) => chain.testnet);
  const mainnetChains = Object.entries(chains).filter(([_, chain]) => !chain.testnet);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold mb-8">{t("title")}</h1>
        {authenticated && <Profile logoutAction={handleLogout} />}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t("mainnet")}</h2>
        <div className="space-y-4">
          {mainnetChains.map(([chainName, chain]) => (
            <ChainCard
              key={chainName}
              chainName={chainName as ChainName}
              chain={chain}
              onSelect={() => handleChainSelect(chainName as ChainName)}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">{t("testnet")}</h2>
        <div className="space-y-4">
          {testnetChains.map(([chainName, chain]) => (
            <ChainCard
              key={chainName}
              chainName={chainName as ChainName}
              chain={chain}
              onSelect={() => handleChainSelect(chainName as ChainName)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ChainCard({
  chainName,
  chain,
  onSelect,
}: {
  chainName: ChainName;
  chain: (typeof chains)[ChainName];
  onSelect: () => void;
}) {
  const t = useTranslations("chainSelection");

  return (
    <div onClick={onSelect}>
      <Card className="hover:bg-accent transition-colors cursor-pointer">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{chain.name}</span>
            <ExternalLink className="h-4 w-4" />
          </CardTitle>
          <CardDescription>{t("chainId", { id: chain.id })}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{t("blockExplorer")}</span>
            <span className="text-primary">{chain.BLOCK_EXPLORER_URL}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
