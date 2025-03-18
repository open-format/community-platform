"use client";

import { settingsFacetAbi } from "@/abis/SettingsFacet";
import envConfig from "@/constants/config";
import { ADMIN_ROLE } from "@/helpers/contract";
import { createAgentWallet } from "@/lib/openformat";
import { sendTransaction, waitForTransactionReceipt, writeContract } from "@wagmi/core";
import { Bot, CheckCircle, CreditCard, Key, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Address } from "viem";
import { encodeFunctionData, formatEther, parseEther } from "viem";
import { useBalance, useConfig, useReadContract } from "wagmi";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface SetupAgentProps {
  community: Community;
  agentWallet: string | null;
}

export default function SetupAgent({ community, agentWallet }: SetupAgentProps) {
  const config = useConfig();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<Address | null>(
    agentWallet ? (agentWallet as Address) : null,
  );
  const [discordAuthStarted, setDiscordAuthStarted] = useState(false);
  const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
    address: walletAddress as Address,
    query: {
      enabled: !!walletAddress,
      // Force refetch when balanceKey changes
      refetchInterval: completedSteps.includes(3) ? 3000 : false,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: true,
      staleTime: 5000,
    },
  });

  const formattedBalance = balanceData
    ? `${Number.parseFloat(formatEther(balanceData.value)).toFixed(4)} ${balanceData.symbol}`
    : "0";

  const { data: permissions } = useReadContract({
    config,
    address: community.id as Address,
    abi: settingsFacetAbi,
    functionName: "hasRole",
    args: [ADMIN_ROLE, walletAddress as Address],
  });

  // Initialize completedSteps based on agentWallet and permissions
  useEffect(() => {
    const updatedSteps = [...completedSteps];

    // Mark step 1 as complete if wallet exists
    if (agentWallet && !updatedSteps.includes(1)) {
      updatedSteps.push(1);
    }

    // Mark step 2 as complete if permissions are granted
    if (permissions === true && !updatedSteps.includes(2)) {
      updatedSteps.push(2);
    }

    if (updatedSteps.length !== completedSteps.length) {
      setCompletedSteps(updatedSteps);
    }
  }, [agentWallet, permissions, completedSteps]);

  const handleCreateWallet = async () => {
    setIsLoading(true);
    setError(null);
    setCurrentStep(1);
    try {
      const wallet = await createAgentWallet(community.id);
      if (!wallet) {
        throw new Error("Failed to create wallet");
      }
      setWalletAddress(wallet.address as Address);
      setCompletedSteps((prev) => [...prev, 1]);
      toast.success("Wallet created successfully!", {
        icon: <CheckCircle className="text-green-500" />,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupPermissions = async () => {
    setIsLoading(true);
    setError(null);
    setCurrentStep(2);
    try {
      const enableAccessControlData = encodeFunctionData({
        abi: settingsFacetAbi,
        functionName: "enableAccessControl",
      });

      const grantRoleData = encodeFunctionData({
        abi: settingsFacetAbi,
        functionName: "grantRole",
        args: [ADMIN_ROLE, walletAddress as Address],
      });

      const hash = await writeContract(config, {
        address: community.id as Address,
        abi: settingsFacetAbi,
        functionName: "multicall",
        args: [[enableAccessControlData, grantRoleData]],
      });

      await waitForTransactionReceipt(config, { hash });
      setCompletedSteps((prev) => [...prev, 2]);
      toast.success("Permissions set up successfully!", {
        icon: <CheckCircle className="text-green-500" />,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFundWallet = async () => {
    setIsLoading(true);
    setError(null);
    setCurrentStep(3);
    try {
      if (!walletAddress) {
        throw new Error("No agent wallet address found");
      }

      const hash = await sendTransaction(config, {
        to: walletAddress,
        value: parseEther("0.01"),
      });

      await waitForTransactionReceipt(config, { hash });
      setCompletedSteps((prev) => [...prev, 3]);

      toast.success("Wallet funded successfully!", {
        icon: <CheckCircle className="text-green-500" />,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToDiscord = () => {
    window.open(envConfig.DISCORD_BOT_OAUTH, "_blank");
    setDiscordAuthStarted(true);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Agent Profile Section with Balance */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-primary/10 p-3">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1">
            <h2 className="font-semibold">{community.name} Agent</h2>
            <div className="flex flex-col space-y-1">
              {agentWallet || walletAddress ? (
                <>
                  <span className="font-mono text-sm text-muted-foreground">
                    {agentWallet || walletAddress}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Balance:</span>
                    {isBalanceLoading ? (
                      <span className="text-xs italic">Loading...</span>
                    ) : (
                      <Badge className="text-xs font-semibold">{formattedBalance}</Badge>
                    )}
                  </div>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">Wallet pending creation</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Setup Process */}
      <div className="space-y-6">
        {/* Step 1: Create Agent Wallet */}
        <div className="flex items-start gap-4">
          <div
            className={`rounded-full p-2 shrink-0 ${
              completedSteps.includes(1) || agentWallet ? "bg-green-50" : "bg-muted"
            }`}
          >
            {agentWallet || completedSteps.includes(1) ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : (
              <Key className="h-6 w-6" />
            )}
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold">1. Create Agent Wallet</h3>
            <p className="text-sm text-muted-foreground">
              Creating a secure wallet for your agent to manage community rewards and badges.
            </p>
            {!agentWallet && !completedSteps.includes(1) ? (
              <Button
                onClick={handleCreateWallet}
                className="mt-2"
                disabled={isLoading || completedSteps.includes(1)}
              >
                {isLoading && currentStep === 1 ? "Creating..." : "Create Wallet"}
              </Button>
            ) : (
              <div className="mt-2 text-sm text-green-600 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Wallet created successfully</span>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Setup Permissions */}
        <div className="flex items-start gap-4">
          <div
            className={`rounded-full p-2 shrink-0 ${
              completedSteps.includes(2) || permissions === true ? "bg-green-50" : "bg-muted"
            }`}
          >
            {completedSteps.includes(2) || permissions === true ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : (
              <Shield className="h-6 w-6" />
            )}
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold">2. Setup Permissions</h3>
            <p className="text-sm text-muted-foreground">
              Configure permissions for your agent. This requires a single transaction.
            </p>
            {!completedSteps.includes(2) && permissions !== true ? (
              <Button
                onClick={handleSetupPermissions}
                className="mt-2"
                disabled={isLoading || !completedSteps.includes(1)}
              >
                {isLoading && currentStep === 2 ? "Setting up..." : "Setup Permissions"}
              </Button>
            ) : (
              <div className="mt-2 text-sm text-green-600 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Permissions set up successfully</span>
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Fund Wallet */}
        <div className="flex items-start gap-4">
          <div
            className={`rounded-full p-2 shrink-0 ${
              completedSteps.includes(3) ? "bg-green-50" : "bg-muted"
            }`}
          >
            {completedSteps.includes(3) ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : (
              <CreditCard className="h-6 w-6" />
            )}
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold">3. Fund Agent Wallet</h3>
            <p className="text-sm text-muted-foreground">
              Send 0.01 tokens to your agent's wallet to cover gas costs for future transactions.
            </p>
            {!completedSteps.includes(3) ? (
              <Button
                onClick={handleFundWallet}
                className="mt-2"
                disabled={isLoading || !completedSteps.includes(2)}
              >
                {isLoading && currentStep === 3 ? "Funding..." : "Fund Wallet"}
              </Button>
            ) : (
              <div className="mt-2 text-sm text-green-600 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Wallet funded successfully</span>
              </div>
            )}
          </div>
        </div>

        {/* Step 4: Add to Discord Bot */}
        <div className="flex items-start gap-4">
          <div
            className={`rounded-full p-2 shrink-0 ${
              completedSteps.includes(4) ? "bg-green-50" : "bg-muted"
            }`}
          >
            {completedSteps.includes(4) ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : (
              <Bot className="h-6 w-6" />
            )}
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold">4. Add to Discord Bot</h3>
            <p className="text-sm text-muted-foreground">
              Integrate your agent with your community's Discord server.
            </p>

            {completedSteps.includes(4) ? (
              <div className="mt-2 text-sm text-green-600 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Bot successfully added to Discord server</span>
              </div>
            ) : discordAuthStarted ? (
              <div className="mt-2 space-y-2">
                <p className="text-sm text-amber-600">Have you added the bot to your server?</p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setDiscordAuthStarted(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => {
                      setCompletedSteps((prev) => [...prev, 4]);
                      setDiscordAuthStarted(false);
                      toast.success("Discord integration confirmed!", {
                        icon: <CheckCircle className="text-green-500" />,
                      });
                    }}
                  >
                    Yes, I've Added the Bot
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={handleAddToDiscord}
                className="mt-2"
                disabled={!completedSteps.includes(3)}
              >
                Add to Discord
              </Button>
            )}
          </div>
        </div>
      </div>

      {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">{error}</div>}
    </div>
  );
}
