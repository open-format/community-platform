"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { rewardFacetAbi } from "@/abis/RewardFacet";
import { Confetti } from "@/components/confetti";
import TokenSelector from "@/components/token-selector";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import UserSelector from "@/components/user-selector";
import RewardSuccessDialog from "@/dialogs/reward-success-dialog";
import { handleViemError } from "@/helpers/errors";
import { revalidate } from "@/lib/openformat";
import { uploadMetadata } from "@/lib/thirdweb";
import { sanitizeString } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePrivy } from "@privy-io/react-auth";
import { readContract, waitForTransactionReceipt, writeContract } from "@wagmi/core";
import { HelpCircle, Plus, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { type Address, BaseError, erc20Abi, formatEther, maxUint256, parseEther, stringToHex } from "viem";
import { useConfig } from "wagmi";
import * as z from "zod";

const rewardsFormSchema = z.object({
  user: z.string().min(1, "User handle is required"),
  tokenAddress: z.string().min(1, "Token is required"),
  amount: z.coerce.number().min(10 ** -18, "Amount must be at least 0.000000000000000001"),
  rewardId: z.string().min(3, "Reward ID must be at least 3 characters"),
  actionType: z.enum(["mint", "transfer"]).default("mint"),
  metadata: z
    .array(
      z.object({
        key: z.string().min(1, "Key is required"),
        value: z.string().min(1, "Value is required"),
      })
    )
    .optional()
    .default([])
    // @TODO fix types
    .transform((arr) => arr.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})),
});

type RewardsFormValues = z.infer<typeof rewardsFormSchema>;

export default function RewardsForm({ community }: { community: Community }) {
  const [isPending, startTransition] = useTransition();
  const { user } = usePrivy();
  const [showConfetti, setShowConfetti] = useState(false);
  const config = useConfig();
  const [rewardSuccessDialog, setRewardSuccessDialog] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | undefined>(undefined);
  const [tokenBalance, setTokenBalance] = useState<bigint | undefined>(undefined);

  const form = useForm<RewardsFormValues>({
    resolver: zodResolver(rewardsFormSchema),
    defaultValues: {
      user: "",
      tokenAddress: "",
      amount: undefined,
      rewardId: "",
      actionType: "mint",
      metadata: [
        {
          key: "member_type",
          value: "developer",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "metadata",
  });

  const isSelectedBadge = (tokenAddress: string) => community.badges.some((badge) => badge.id === tokenAddress);

  useEffect(() => {
    async function fetchTokenBalance() {
      if (user?.wallet?.address && form.watch("tokenAddress")) {
        try {
          const balance = await readContract(config, {
            address: form.watch("tokenAddress") as Address,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [user.wallet.address as Address],
          });
          setTokenBalance(balance);
        } catch (error) {
          console.error("Failed to fetch token balance", error);
          setTokenBalance(undefined);
        }
      } else {
        setTokenBalance(undefined);
      }
    }

    fetchTokenBalance();
  }, [user?.wallet?.address, form.watch("tokenAddress"), config]);

  function onSubmit(data: RewardsFormValues) {
    try {
      startTransition(async () => {
        const toastId = toast.loading("Processing reward...");

        try {
          // Check if selected token is a badge or token
          const isSelectedBadge = community.badges.some((badge) => badge.id === data.tokenAddress);

          let ipfsHash = "";
          // upload the metadata to IPFS
          if (Object.keys(data.metadata).length > 0) {
            ipfsHash = await uploadMetadata(data.metadata);
            console.log({ ipfsHash });
          }

          // Use different contract function based on token type
          if (isSelectedBadge) {
            const badgeTransaction = await writeContract(config, {
              address: community.id,
              abi: rewardFacetAbi,
              functionName: "mintBadge",
              args: [
                data.tokenAddress as Address,
                data.user as Address,
                stringToHex(data.rewardId, { size: 32 }),
                stringToHex("MISSION", { size: 32 }),
                stringToHex(ipfsHash),
              ],
            });

            const receipt = await waitForTransactionReceipt(config, {
              hash: badgeTransaction,
            });
            setTransactionHash(receipt.transactionHash);
            toast.success("Badge successfully awarded!", { id: toastId });
          } else if (data.actionType === "mint") {
            // Handle ERC20 token minting
            const hash = await writeContract(config, {
              address: community.id,
              abi: rewardFacetAbi,
              functionName: "mintERC20",
              args: [
                data.tokenAddress as Address,
                data.user as Address,
                parseEther(data.amount.toString()),
                stringToHex(data.rewardId, { size: 32 }),
                stringToHex("MISSION", { size: 32 }),
                ipfsHash,
              ],
            });

            const receipt = await waitForTransactionReceipt(config, { hash });
            toast.success("Tokens successfully awarded!", { id: toastId });
            setTransactionHash(receipt.transactionHash);
            form.reset();
          } else {
            const allowance = await readContract(config, {
              address: data.tokenAddress as Address,
              abi: erc20Abi,
              functionName: "allowance",
              args: [user?.wallet?.address as Address, community.id as Address],
            });

            if (allowance < parseEther(data.amount.toString())) {
              // Call ERC20 contract to approve the DAPP_ID
              await writeContract(config, {
                address: data.tokenAddress as Address,
                abi: erc20Abi,
                functionName: "approve",
                args: [community.id as Address, maxUint256],
              });
            }

            const transferHash = await writeContract(config, {
              address: community.id,
              abi: rewardFacetAbi,
              functionName: "transferERC20",
              args: [
                data.tokenAddress as Address,
                data.user as Address,
                parseEther(data.amount.toString()),
                stringToHex(data.rewardId, { size: 32 }),
                stringToHex("MISSION", { size: 32 }),
                ipfsHash,
              ],
            });

            const receipt = await waitForTransactionReceipt(config, {
              hash: transferHash,
            });
            toast.success("Tokens successfully transferred!", { id: toastId });
            setTransactionHash(receipt.transactionHash);
            form.reset();
          }

          // After successful transaction
          toast.dismiss(toastId);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000); // Hide confetti after 5 seconds
          setRewardSuccessDialog(true);
          revalidate();
        } catch (error) {
          if (error instanceof BaseError) {
            handleViemError(error);
          }
          toast.error("Failed to process reward", { id: toastId });
        }
      });
    } catch (e) {
      toast.error("An unexpected error occurred");
    }
  }

  return (
    <FormProvider {...form}>
      <Confetti isVisible={showConfetti} />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* User */}
        <FormField
          control={form.control}
          name="user"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User Handle</FormLabel>
              <FormControl>
                <UserSelector field={field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Token and Action Type */}
        <div className="grid grid-cols-3 gap-4 items-end">
          <FormField
            control={form.control}
            name="tokenAddress"
            render={({ field }) => (
              <FormItem className="col-span-2 flex flex-col gap-2">
                <FormLabel>Token or Badge</FormLabel>
                <FormControl>
                  <TokenSelector
                    tokens={community.tokens}
                    badges={community.badges}
                    value={field.value}
                    onChange={field.onChange}
                    onTokenTypeChange={(isBadge) => {
                      if (isBadge) {
                        form.setValue("amount", 1);
                      } else {
                        form.setValue("amount", undefined);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Action Type */}
          <FormField
            control={form.control}
            name="actionType"
            render={({ field }) => (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <p>Action Type</p>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Clear amount when action type changes
                            form.setValue("amount", undefined);
                            form.setError("amount", { type: "manual", message: "" });
                          }}
                          defaultValue={field.value}
                          disabled={
                            // Disable when a badge is selected
                            isSelectedBadge(form.watch("tokenAddress")) ||
                            (form.watch("tokenAddress") &&
                              !isSelectedBadge(form.watch("tokenAddress")) &&
                              (!tokenBalance || tokenBalance === 0n))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select action" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mint">Mint</SelectItem>
                            <SelectItem
                              value="transfer"
                              disabled={
                                form.watch("tokenAddress") &&
                                !isSelectedBadge(form.watch("tokenAddress")) &&
                                (!tokenBalance || tokenBalance === 0n)
                              }
                            >
                              Transfer
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="start" className="max-w-prose space-y-2">
                    <p>Mint: Create new tokens for the user, no existing balance required.</p>
                    <p>
                      Transfer: Requires approval and sufficient balance. If your connected wallet does not have enough
                      balance, the transfer option will be disabled.
                    </p>

                    <p>Action type is fixed to Mint for badges.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          />
        </div>

        {/* Amount */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={isSelectedBadge(form.watch("tokenAddress")) ? 1 : field.value ?? ""}
                  onChange={(e) => {
                    if (!isSelectedBadge(form.watch("tokenAddress"))) {
                      field.onChange(e.target.value === "" ? undefined : e.target.value);
                    }
                  }}
                  onBlur={(e) => {
                    // Only perform balance check for non-badge tokens and when action type is transfer
                    if (!isSelectedBadge(form.watch("tokenAddress")) && form.watch("actionType") === "transfer") {
                      const inputAmount = Number.parseFloat(e.target.value);
                      const tokenBalanceInEther = tokenBalance ? Number(formatEther(tokenBalance)) : 0;

                      if (inputAmount > tokenBalanceInEther) {
                        form.setError("amount", {
                          type: "manual",
                          message: `Insufficient balance. Max available: ${tokenBalanceInEther.toFixed(4)} tokens`,
                        });
                      } else {
                        form.clearErrors("amount");
                      }
                    }
                  }}
                  disabled={isSelectedBadge(form.watch("tokenAddress"))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Reward ID */}
        <FormField
          control={form.control}
          name="rewardId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reward Identifier</FormLabel>
              <FormControl>
                <Input
                  placeholder="welcome-to-the-community, first-post, bug-fix etc."
                  {...field}
                  onBlur={(e) => {
                    field.onChange(
                      sanitizeString(e.target.value, {
                        replaceSpacesWith: "-",
                      })
                    );
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Metadata */}
        <FormField
          control={form.control}
          name="metadata"
          render={() => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Metadata (Optional)</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ key: "", value: "" })}
                  className="h-8"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Field
                </Button>
              </div>
              <FormControl>
                <div className="space-y-2 mt-2">
                  {fields.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <Input
                        type="text"
                        placeholder="Key"
                        className="flex-1"
                        {...form.register(`metadata.${index}.key`)}
                      />
                      <Input
                        type="text"
                        placeholder="Value"
                        className="flex-1"
                        {...form.register(`metadata.${index}.value`)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => remove(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending || !form.formState.isValid}>
          {isPending ? "Rewarding..." : "Reward"}
        </Button>
      </form>
      <RewardSuccessDialog
        open={rewardSuccessDialog}
        onOpenChange={setRewardSuccessDialog}
        communityId={community.id}
        transactionHash={transactionHash}
      />
    </FormProvider>
  );
}
