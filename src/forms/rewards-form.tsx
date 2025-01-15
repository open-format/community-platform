"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { rewardFacetAbi } from "@/abis/RewardFacet";
import { Confetti } from "@/components/confetti";
import TokenSelector from "@/components/token-selector";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import UserSelector from "@/components/user-selector";
import RewardSuccessDialog from "@/dialogs/reward-success-dialog";
import { handleViemError } from "@/helpers/errors";
import { revalidate } from "@/lib/openformat";
import { uploadMetadata } from "@/lib/thirdweb";
import { sanitizeString } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { waitForTransactionReceipt, writeContract } from "@wagmi/core";
import { Plus, X } from "lucide-react";
import { useState, useTransition } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { type Address, BaseError, parseEther, stringToHex } from "viem";
import { useConfig } from "wagmi";
import * as z from "zod";

const rewardsFormSchema = z.object({
  user: z.string().min(1, "User handle is required"),
  tokenAddress: z.string().min(1, "Token is required"),
  amount: z.coerce.number().min(10 ** -18, "Amount must be at least 0.000000000000000001"),
  rewardId: z.string().min(3, "Reward ID must be at least 3 characters"),
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
  const [showConfetti, setShowConfetti] = useState(false);
  const config = useConfig();
  const [rewardSuccessDialog, setRewardSuccessDialog] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | undefined>(undefined);

  const form = useForm<RewardsFormValues>({
    resolver: zodResolver(rewardsFormSchema),
    defaultValues: {
      user: "",
      tokenAddress: "",
      amount: undefined,
      rewardId: "",
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

  function onSubmit(data: RewardsFormValues) {
    try {
      startTransition(async () => {
        const toastId = toast.loading("Processing reward...");

        try {
          // Check if selected token is a badge or token
          const isSelectedBadge = community.badges.some((badge) => badge.id === data.tokenAddress);
          const isSelectedToken = community.tokens.some((token) => token.token.id === data.tokenAddress);

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
          } else if (isSelectedToken) {
            // Handle ERC20 token minting (current implementation)
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

        {/* Token */}
        <FormField
          control={form.control}
          name="tokenAddress"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2">
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
