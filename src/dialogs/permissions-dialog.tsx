"use client";

import { settingsFacetAbi } from "@/abis/SettingsFacet";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { OPERATOR_ROLE } from "@/helpers/contract";
import { waitForTransactionReceipt, writeContract } from "@wagmi/core";
import { CheckCircle, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import { startTransition, useState } from "react";
import { toast } from "sonner";
import { type Address, parseGwei } from "viem";
import { useChainId, useConfig } from "wagmi";

interface PermissionsDialogProps {
  children: React.ReactNode;
  agentWallet: Address;
  community: Community;
  refetchPermissions: () => void;
}

export default function PermissionsDialog({
  agentWallet,
  community,
  children,
  refetchPermissions,
}: PermissionsDialogProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const t = useTranslations("communities.create");
  const chainId = useChainId();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const config = useConfig();

  function toggle() {
    refetchPermissions();
    setError(null);
    setIsOpen((t) => !t);
  }

  async function handleSetupPermissions() {
    setIsLoading(true);
    console.log("revoking permissions", chainId);
    startTransition(async () => {
      console.log("revoking permissions", chainId);
      try {
        const overrides = {};

        if (chainId === 1313161554) {
          overrides.maxFeePerGas = parseGwei("0.08");
          overrides.maxPriorityFeePerGas = parseGwei("0.08");
        }

        const hash = await writeContract(config, {
          address: community.id as Address,
          abi: settingsFacetAbi,
          functionName: "revokeRole",
          args: [OPERATOR_ROLE, agentWallet as Address],
          ...overrides,
        });

        await waitForTransactionReceipt(config, { hash });

        toast.success("Permissions successfully revoked!", {
          icon: <CheckCircle className="text-green-500" />,
        });
        toggle();
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        console.log("revoking permissions", chainId);
        setIsLoading(false);
      }
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={toggle}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Permissions
          </DialogTitle>
        </DialogHeader>
        <p>
          Your agent currently has permissions to mint any tokens or badges without your input.
          These powerful permissions allow automations to run independently.
        </p>
        <p>
          These permissions can be revoked at any time, but doing so will prevent any automation
          rules from running in your community.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={toggle}>
            Close
          </Button>
          <Button variant="destructive" onClick={handleSetupPermissions} disabled={isLoading}>
            {isLoading ? "Revoking..." : "Revoke Permissions"}
          </Button>
        </DialogFooter>
        {error && <p className="text-red-500 text-xs">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}
