"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { rewardFacetAbi } from "@/abis/RewardFacet";
import TokenSelector from "@/components/token-selector";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import UserSelector from "@/components/user-selector";
import { uploadMetadata } from "@/lib/thirdweb";
import { zodResolver } from "@hookform/resolvers/zod";
import { waitForTransactionReceipt, writeContract } from "@wagmi/core";
import { Plus, X } from "lucide-react";
import { useState, useTransition } from "react";
import Confetti from "react-confetti";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { type Address, parseEther, stringToHex } from "viem";
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

  const form = useForm<RewardsFormValues>({
    resolver: zodResolver(rewardsFormSchema),
    defaultValues: {
      user: "",
      tokenAddress: "",
      amount: undefined,
      rewardId: "",
      metadata: [
        {
          key: "platform",
          value: "discord",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "metadata",
  });

  function onSubmit(data: RewardsFormValues) {
    try {
      startTransition(async () => {
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

          const badgeTransactionReceipt = await waitForTransactionReceipt(config, { hash: badgeTransaction });
          console.log({ badgeTransactionReceipt });
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
          console.log({ receipt });
        }

        // After successful transaction
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000); // Hide confetti after 5 seconds
      });
    } catch (e) {
      // @TODO: Create error handler for contract calls
      console.error(e);
    }
  }

  return (
    <FormProvider {...form}>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          style={{ position: "fixed", top: 0, left: 0, zIndex: 100 }}
          confettiSource={{
            x: 0,
            y: window.innerHeight, // start from bottom
            w: window.innerWidth,
            h: 0,
          }}
          numberOfPieces={500}
          recycle={false}
          initialVelocityY={{ min: -30, max: -10 }} // negative values make it go upward
          gravity={0.3} // increased gravity to make it fall back down
        />
      )}
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
              <FormLabel>Token</FormLabel>
              <FormControl>
                <TokenSelector
                  tokens={community.tokens}
                  badges={community.badges}
                  value={field.value}
                  onChange={field.onChange}
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
                  value={field.value ?? ""}
                  //@TODO improve onChange handling
                  onChange={(e) => field.onChange(e.target.value === "" ? undefined : e.target.value)}
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
                <Input placeholder="Enter reward identifier" {...field} />
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
              <FormLabel>Metadata (Optional)</FormLabel>
              <FormControl>
                <div className="flex flex-col gap-2">
                  {fields.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <Input type="text" placeholder="Key" {...form.register(`metadata.${index}.key`)} />
                      <Input type="text" placeholder="Value" {...form.register(`metadata.${index}.value`)} />
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="ghost" size="icon" onClick={() => append({ key: "", value: "" })}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending || !form.formState.isValid}>
          {isPending ? "Processing..." : "Reward"}
        </Button>
      </form>
    </FormProvider>
  );
}
