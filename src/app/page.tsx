"use client";

import { chains, type ChainName } from "@/constants/chains";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";

export default function ChainSelectionPage() {
  const router = useRouter();
  const { login, ready, authenticated } = usePrivy();
  const [selectedChain, setSelectedChain] = useState<ChainName | null>(null);

  useEffect(() => {
    if (ready && authenticated && selectedChain) {
      router.push(`/${selectedChain}/communities`);
    }
  }, [ready, authenticated, selectedChain, router]);

  const handleChainSelect = async (chainName: ChainName, chain: typeof chains[ChainName]) => {
    if (!authenticated) {
      setSelectedChain(chainName);
      await login();
    } else {
      router.push(`/${chainName}/communities`);
    }
  };

  const testnetChains = Object.entries(chains).filter(([_, chain]) => chain.testnet);
  const mainnetChains = Object.entries(chains).filter(([_, chain]) => !chain.testnet);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Select a Blockchain</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Mainnet</h2>
        <div className="space-y-4">
          {mainnetChains.map(([chainName, chain]) => (
            <ChainCard 
              key={chainName} 
              chainName={chainName as ChainName} 
              chain={chain}
              onSelect={() => handleChainSelect(chainName as ChainName, chain)}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Testnet</h2>
        <div className="space-y-4">
          {testnetChains.map(([chainName, chain]) => (
            <ChainCard 
              key={chainName} 
              chainName={chainName as ChainName} 
              chain={chain}
              onSelect={() => handleChainSelect(chainName as ChainName, chain)}
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
  onSelect 
}: { 
  chainName: ChainName; 
  chain: typeof chains[ChainName];
  onSelect: () => void;
}) {
  return (
    <div onClick={onSelect}>
      <Card className="hover:bg-accent transition-colors cursor-pointer">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{chain.name}</span>
            <ExternalLink className="h-4 w-4" />
          </CardTitle>
          <CardDescription>Chain ID: {chain.id}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Block Explorer:</span>
            <span className="text-primary">
              {chain.BLOCK_EXPLORER_URL}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
