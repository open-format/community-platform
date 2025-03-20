"use client";

import { settingsFacetAbi } from "@/abis/SettingsFacet";
import envConfig from "@/constants/config";
import PermissionsDialog from "@/dialogs/permissions-dialog";
import { ADMIN_ROLE } from "@/helpers/contract";
import { txOverrides } from "@/lib/chain";
import { createAgentWallet } from "@/lib/openformat";
import { addressSplitter, cn } from "@/lib/utils";
import { sendTransaction, waitForTransactionReceipt, writeContract } from "@wagmi/core";
import {
  Bot,
  CheckCircle,
  CoinsIcon,
  CreditCard,
  Key,
  ShieldCheckIcon,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Address } from "viem";
import { encodeFunctionData, formatEther, parseEther } from "viem";
import { useBalance, useChainId, useConfig, useReadContract } from "wagmi";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
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
  const [balanceHighlighted, setBalanceHighlighted] = useState(false);
  const [fundingAmount, setFundingAmount] = useState<number>();
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
  const chainId = useChainId();

  const formattedBalance = balanceData
    ? `${Number.parseFloat(formatEther(balanceData.value)).toFixed(7)} ${balanceData.symbol}`
    : "0";

  const { data: permissions, refetch: refetchPermissions } = useReadContract({
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

  // Add this new useEffect to update completed steps when permissions change
  useEffect(() => {
    if (permissions === false && completedSteps.includes(2)) {
      // Remove step 2 from completed steps if permissions were revoked
      setCompletedSteps((prev) => prev.filter((step) => step !== 2));
    }
  }, [permissions, completedSteps]);

  const handleCreateWallet = async () => {
    setIsLoading(true);
    setError(null);
    setCurrentStep(1);
    try {
      const wallet = await createAgentWallet(community);
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
        ...txOverrides(chainId),
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

      if (!fundingAmount) {
        throw new Error("No funding amount provided");
      }

      const hash = await sendTransaction(config, {
        to: walletAddress,
        value: parseEther(fundingAmount?.toString()),
        ...txOverrides(chainId),
      });

      await waitForTransactionReceipt(config, { hash });
      setCompletedSteps((prev) => [...prev, 3]);

      // Highlight the balance
      setBalanceHighlighted(true);

      // Reset highlight after 5 seconds
      setTimeout(() => {
        setBalanceHighlighted(false);
      }, 5000);

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

  const confirmDiscordIntegration = () => {
    setCompletedSteps((prev) => [...prev, 4]);
    setDiscordAuthStarted(false);
    toast.success("Discord integration confirmed!", {
      icon: <CheckCircle className="text-green-500" />,
    });
  };

  const STEPS = [
    {
      title: "Create Agent Wallet",
      description:
        "Creating a secure wallet for your agent to manage community rewards and badges.",
      icon: <Key className="h-6 w-6" />,
      action: {
        onClick: handleCreateWallet,
        isLoading: isLoading && currentStep === 1,
        disabled: isLoading || completedSteps.includes(1),
        label: "Create Wallet",
      },
      completed: completedSteps.includes(1) || !!walletAddress,
      completedMessage: "Wallet created successfully",
    },
    {
      title: "Setup Permissions",
      description: "Configure permissions for your agent. This requires a single transaction.",
      icon: <ShieldCheckIcon className="h-6 w-6" />,
      action: {
        onClick: handleSetupPermissions,
        isLoading: isLoading && currentStep === 2,
        disabled: isLoading || !walletAddress,
        label: "Setup Permissions",
      },
      completed: completedSteps.includes(2) || permissions === true,
      completedMessage: "Permissions set up successfully",
    },
    {
      title: "Fund Agent Wallet",
      description: "Send tokens to your agent's wallet to cover gas costs for future transactions.",
      icon: <CreditCard className="h-6 w-6" />,
      action: {
        onClick: handleFundWallet,
        isLoading: isLoading && currentStep === 3,
        disabled: isLoading || !(completedSteps.includes(2) || permissions === true),
        label: "Fund Wallet",
      },
      completed: completedSteps.includes(3),
      completedMessage: "Wallet funded successfully",
      customInput: {
        type: "number",
        step: 0.01,
        min: 0.01,
        defaultValue: 0.01,
        value: fundingAmount,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setFundingAmount(e.target.value),
      },
    },
    {
      title: "Add to Discord Bot",
      description: "Integrate your agent with your community's Discord server.",
      icon: <Bot className="h-6 w-6" />,
      action: {
        onClick: handleAddToDiscord,
        isLoading: false,
        disabled: false,
        label: "Add to Discord",
      },
      completed: completedSteps.includes(4),
      completedMessage: "Bot successfully added to Discord server",
      // Special Discord UI elements
      discordState: {
        authStarted: discordAuthStarted,
        onCancel: () => setDiscordAuthStarted(false),
        onConfirm: confirmDiscordIntegration,
      },
    },
  ];

  return (
    <div className="space-y-6 p-4">
      {/* Agent Profile Section with Balance */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="rounded-full bg-primary/10 p-3">
            <Bot className="h-12 w-12 text-primary" />
          </div>
          <div className="space-y-1 text-center md:text-left w-full">
            <h1 className="font-semibold capitalize flex items-center gap-1 justify-center md:justify-start">
              {community.name} Agent
              {(permissions === true || completedSteps.includes(2)) && (
                <PermissionsDialog
                  agentWallet={walletAddress as Address}
                  community={community}
                  refetchPermissions={refetchPermissions}
                >
                  <ShieldCheckIcon className="h-6 w-6 text-green-500" />
                </PermissionsDialog>
              )}
            </h1>
            <div className="flex flex-col">
              {agentWallet || walletAddress ? (
                <div className="flex md:flex-row items-center gap-2 md:gap-6">
                  <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-start">
                    <Wallet className="h-4 w-4" />
                    <span className="text-sm">
                      {addressSplitter(agentWallet || (walletAddress as Address), 6)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-start">
                    <CoinsIcon className="h-4 w-4" />
                    {isBalanceLoading ? (
                      <span className="text-xs">Loading...</span>
                    ) : (
                      <span
                        className={cn(
                          "text-sm",
                          balanceHighlighted && "animate-pulse text-green-500",
                        )}
                      >
                        {formattedBalance}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Pending wallet creation</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STEPS.map((step, index) => (
          <StepCard
            key={index}
            title={step.title}
            description={step.description}
            completed={step.completed}
            icon={step.icon}
            action={step.action}
            completedMessage={step.completedMessage}
            discordState={index === 3 ? step.discordState : undefined}
            customInput={index === 2 ? step.customInput : undefined}
          />
        ))}
      </div>

      {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">{error}</div>}
    </div>
  );
}

interface StepCardProps {
  title: string;
  description: string;
  completed: boolean;
  icon: React.ReactNode;
  action: {
    onClick: () => void;
    isLoading: boolean;
    disabled: boolean;
    label: string;
  };
  completedMessage: string;
  discordState?: {
    authStarted: boolean;
    onCancel: () => void;
    onConfirm: () => void;
  };
  customInput?: {
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    label: string;
  };
}

export function StepCard({
  title,
  description,
  completed,
  icon,
  action,
  completedMessage,
  discordState,
  customInput,
}: StepCardProps) {
  return (
    <Card>
      <CardHeader>
        {completed ? (
          <div className="rounded-full bg-green-50 p-2 w-fit">
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
        ) : (
          <div className="rounded-full bg-muted p-2 w-fit">{icon}</div>
        )}
      </CardHeader>
      <CardContent>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardContent>
      <CardFooter>
        {completed ? (
          <div className="text-sm text-green-600 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span>{completedMessage}</span>
          </div>
        ) : discordState?.authStarted ? (
          <div className="space-y-2 w-full">
            <p className="text-sm text-amber-600">Have you added the bot to your server?</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={discordState.onCancel}>
                Cancel
              </Button>
              <Button variant="default" onClick={discordState.onConfirm}>
                Yes, I've Added the Bot
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {customInput && !completed && (
              <input {...customInput} className="w-full mt-1 px-3 py-2 border rounded-md text-sm" />
            )}
            <Button onClick={action.onClick} disabled={action.disabled}>
              {action.isLoading ? "Processing..." : action.label}
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
