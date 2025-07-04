"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { rewardFacetAbi } from "@/abis/RewardFacet";
import { Confetti } from "@/components/confetti";
import TokenSelector from "@/components/token-selector";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import UserSelector from "@/components/user-selector";
import RewardSuccessDialog from "@/dialogs/reward-success-dialog";
import { handleViemError } from "@/helpers/errors";
import { sendRewardNotification } from "@/helpers/notifications";
import { revalidate } from "@/lib/openformat";
import { uploadMetadata } from "@/lib/thirdweb";
import { sanitizeString } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePrivy } from "@privy-io/react-auth";
import { readContract, waitForTransactionReceipt, writeContract } from "@wagmi/core";
import { HelpCircle, Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  type Address,
  BaseError,
  erc20Abi,
  formatEther,
  maxUint256,
  parseEther,
  stringToHex,
} from "viem";
import { useConfig } from "wagmi";
import * as z from "zod";

export default function RewardsForm({ community }: { community: Community }) {
  const t = useTranslations("rewards");
  const [isPending, startTransition] = useTransition();
  const { user } = usePrivy();
  const [showConfetti, setShowConfetti] = useState(false);
  const config = useConfig();
  const [rewardSuccessDialog, setRewardSuccessDialog] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | undefined>(undefined);
  const [tokenBalance, setTokenBalance] = useState<bigint | undefined>(undefined);
  const [discordUserId, setDiscordUserId] = useState<string | undefined>();
  const [discordUsername, setDiscordUsername] = useState<string | undefined>();
  const [userPlatform, setUserPlatform] = useState<"discord" | "telegram" | "github" | undefined>();

  const rewardsFormSchema = z.object({
    user: z.string().min(1, t("form.validation.userRequired")),
    tokenAddress: z.string().min(1, t("form.validation.tokenRequired")),
    amount: z.preprocess(
      (val) => (val === "" ? Number.NaN : Number(val)),
      z
        .number({
          invalid_type_error: t("form.validation.amountRequired"),
        })
        .min(10 ** -18, t("form.validation.amountMin")),
    ),
    rewardId: z.string().min(3, t("form.validation.rewardIdMin")),
    actionType: z.enum(["mint", "transfer"]).default("mint"),
    metadata: z
      .array(
        z.object({
          key: z.string().min(1, t("form.validation.keyRequired")),
          value: z.string().min(1, t("form.validation.valueRequired")),
        }),
      )
      .optional()
      .default([])
      .transform((arr) => arr.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})),
  });

  const form = useForm<z.infer<typeof rewardsFormSchema>>({
    resolver: zodResolver(rewardsFormSchema),
    mode: "onBlur",
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

  const isSelectedBadge = (tokenAddress: string) =>
    community.onchainData?.badges.some((badge) => badge.id === tokenAddress);

  const getPlatformForNotifications = (): "discord" | "telegram" | null => {
    // Use the user's platform if available, otherwise no notification
    if (userPlatform === "discord" || userPlatform === "telegram") {
      return userPlatform;
    }
    return null; // No notification for users without Discord/Telegram
  };

  useEffect(() => {
    async function fetchTokenBalance() {
      const tokenAddress = form.watch("tokenAddress");
      // Only fetch balance if it's a token, not a badge
      if (user?.wallet?.address && tokenAddress && !isSelectedBadge(tokenAddress)) {
        try {
          const balance = await readContract(config, {
            address: tokenAddress as Address,
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
  }, [user?.wallet?.address, form.watch("tokenAddress"), config, isSelectedBadge]);

  function onSubmit(data: z.infer<typeof rewardsFormSchema>) {
    try {
      startTransition(async () => {
        const toastId = toast.loading(t("form.toast.processing"));

        try {
          // Check if selected token is a badge or token
          const isSelectedBadge = community.onchainData?.badges.some(
            (badge) => badge.id === data.tokenAddress,
          );

          let ipfsHash = "";
          // upload the metadata to IPFS
          if (Object.keys(data.metadata).length > 0) {
            ipfsHash = await uploadMetadata(data.metadata);
          }

          // Use different contract function based on token type
          if (isSelectedBadge) {
            const badgeTransaction = await writeContract(config, {
              address: community.onchainData.id,
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
            toast.success(t("form.toast.badgeSuccess"), {
              id: toastId,
            });

            // Send notification for badge
            const platform = getPlatformForNotifications();
            if (platform) {
              await sendRewardNotification(
                {
                  rewardId: data.rewardId,
                  communityId: community.id,
                  contributorName: discordUsername || data.user,
                  platform,
                  platformUserId: discordUserId,
                  points: 1, // Badges are always 1 point
                  summary: `Received badge: ${data.rewardId}`,
                  description: `You received a badge for: ${data.rewardId}`,
                  transactionHash: receipt.transactionHash,
                },
                "badge",
              );
            }
          } else if (data.actionType === "mint") {
            // Handle ERC20 token minting
            const hash = await writeContract(config, {
              address: community.onchainData.id,
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
            toast.success(t("form.toast.tokensSuccess"), {
              id: toastId,
            });
            setTransactionHash(receipt.transactionHash);
            form.reset();

            // Send notification for token mint
            const platform = getPlatformForNotifications();
            if (platform) {
              await sendRewardNotification(
                {
                  rewardId: data.rewardId,
                  communityId: community.id,
                  contributorName: discordUsername || data.user,
                  platform,
                  platformUserId: discordUserId,
                  points: data.amount,
                  summary: `Received ${data.amount} tokens`,
                  description: `You received ${data.amount} tokens for: ${data.rewardId}`,
                  transactionHash: receipt.transactionHash,
                },
                "mint",
              );
            }
          } else {
            const allowance = await readContract(config, {
              address: data.tokenAddress as Address,
              abi: erc20Abi,
              functionName: "allowance",
              args: [user?.wallet?.address as Address, community.onchainData.id as Address],
            });

            if (allowance < parseEther(data.amount.toString())) {
              // Call ERC20 contract to approve the DAPP_ID
              await writeContract(config, {
                address: data.tokenAddress as Address,
                abi: erc20Abi,
                functionName: "approve",
                args: [community.onchainData.id as Address, maxUint256],
              });
            }

            const transferHash = await writeContract(config, {
              address: community.onchainData.id,
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
            toast.success(t("form.toast.transferSuccess"), {
              id: toastId,
            });
            setTransactionHash(receipt.transactionHash);
            form.reset();

            // Send notification for token transfer
            const platform = getPlatformForNotifications();
            if (platform) {
              await sendRewardNotification(
                {
                  rewardId: data.rewardId,
                  communityId: community.id,
                  contributorName: discordUsername || data.user,
                  platform,
                  platformUserId: discordUserId,
                  points: data.amount,
                  summary: `Received ${data.amount} tokens`,
                  description: `You received ${data.amount} tokens for: ${data.rewardId}`,
                  transactionHash: receipt.transactionHash,
                },
                "transfer",
              );
            }
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
          toast.error(t("form.toast.error.failed"), { id: toastId });
        }
      });
    } catch (e) {
      toast.error(t("form.toast.error.generic"));
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
              <FormLabel>{t("form.user.label")}</FormLabel>
              <FormControl>
                <UserSelector
                  field={field}
                  onUserFound={(userData) => {
                    setDiscordUserId(userData.platformUserId);
                    setDiscordUsername(userData.discordUsername);
                    setUserPlatform(userData.platform);
                  }}
                />
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
                <FormLabel>{t("form.token.label")}</FormLabel>
                <FormControl>
                  <TokenSelector
                    tokens={community?.onchainData?.tokens ?? []}
                    badges={community?.onchainData?.badges ?? []}
                    value={field.value}
                    onChange={field.onChange}
                    onTokenTypeChange={(isBadge, value) => {
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
                        <p>{t("form.fields.actionType.label")}</p>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Clear amount when action type changes
                            form.setValue("amount", undefined);
                            form.setError("amount", {
                              type: "manual",
                              message: "",
                            });
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
                            <SelectValue placeholder={t("form.fields.actionType.placeholder")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mint">
                              {t("form.fields.actionType.options.mint")}
                            </SelectItem>
                            <SelectItem
                              value="transfer"
                              disabled={
                                form.watch("tokenAddress") &&
                                !isSelectedBadge(form.watch("tokenAddress")) &&
                                (!tokenBalance || tokenBalance === 0n)
                              }
                            >
                              {t("form.fields.actionType.options.transfer")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="start" className="max-w-prose space-y-2">
                    <p>{t("form.fields.actionType.tooltip.mint")}</p>
                    <p>{t("form.fields.actionType.tooltip.transfer")}</p>
                    <p>{t("form.fields.actionType.tooltip.badges")}</p>
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
              <FormLabel>{t("form.amount.label")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={t("form.amount.placeholder")}
                  {...field}
                  value={isSelectedBadge(form.watch("tokenAddress")) ? 1 : (field.value ?? "")}
                  onChange={(e) => {
                    if (!isSelectedBadge(form.watch("tokenAddress"))) {
                      field.onChange(
                        e.target.value === "" ? undefined : parseFloat(e.target.value),
                      );
                    }
                  }}
                  onBlur={(e) => {
                    // Only perform balance check for non-badge tokens and when action type is transfer
                    field.onBlur();
                    if (
                      !isSelectedBadge(form.watch("tokenAddress")) &&
                      form.watch("actionType") === "transfer"
                    ) {
                      const inputAmount = Number.parseFloat(e.target.value);
                      const tokenBalanceInEther = tokenBalance
                        ? Number(formatEther(tokenBalance))
                        : 0;

                      if (inputAmount > tokenBalanceInEther) {
                        form.setError("amount", {
                          type: "manual",
                          message: t("form.validation.insufficientBalance", {
                            balance: tokenBalanceInEther.toFixed(4),
                          }),
                        });
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
              <FormLabel>{t("form.fields.rewardId.label")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("form.fields.rewardId.placeholder")}
                  {...field}
                  onBlur={(e) => {
                    const sanitized = sanitizeString(e.target.value, {
                      replaceSpacesWith: "-",
                    });
                    field.onChange(sanitized);
                    field.onBlur();
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
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>{t("form.metadata.label")}</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ key: "", value: "" })}
                  className="h-8"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {t("form.metadata.add")}
                </Button>
              </div>
              <FormControl>
                <div className="space-y-2 mt-2">
                  {fields.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`metadata.${index}.key`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                type="text"
                                placeholder={t("form.metadata.key")}
                                {...field}
                                onBlur={(e) => {
                                  field.onBlur();
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`metadata.${index}.value`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                type="text"
                                placeholder={t("form.metadata.value")}
                                {...field}
                                onBlur={(e) => {
                                  field.onBlur();
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
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
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? t("form.buttons.rewarding") : t("form.buttons.reward")}
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
