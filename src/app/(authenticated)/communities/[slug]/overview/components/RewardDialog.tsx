"use client";

import { rewardFacetAbi } from "@/abis/RewardFacet";
import TokenSelector from "@/components/token-selector";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input, inputVariants } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { handleViemError } from "@/helpers/errors";
import { addressSplitter } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { waitForTransactionReceipt, writeContract } from "@wagmi/core";
import { ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type Address, BaseError, parseEther, stringToHex } from "viem";
import { useConfig } from "wagmi";
import { z } from "zod";

type EvidenceItem = {
  title: string;
  url: string;
};

type ConfirmReward = {
  amount: number;
};

type RewardDialogProps = {
  community: Community;
  recommendation: RewardRecommendation;
  deleteRecommendation: () => void;
  onConfirm: (data: ConfirmReward) => void;
  children: React.ReactNode;
};

// Evidence Details Component
function EvidenceDetails({ evidence }: { evidence: EvidenceItem[] }) {
  const t = useTranslations("overview.rewardRecommendations");

  if (!evidence || evidence.length === 0) {
    return <p className="text-muted-foreground text-sm">{t("noEvidence")}</p>;
  }

  return (
    <div className="space-y-2">
      {evidence.map((item, index) => (
        <Card key={index} className="bg-muted/50">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
          </CardHeader>
          <CardFooter className="p-3 pt-0">
            <Link href={item} target="_blank" rel="noopener noreferrer">
              <p className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                {t("viewEvidence")} <ExternalLink className="h-3 w-3" />
              </p>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default function RewardDialog({
  community,
  recommendation,
  deleteRecommendation,
  children,
}: RewardDialogProps) {
  const t = useTranslations("overview.rewardRecommendations");
  const [open, setOpen] = useState(false);
  const config = useConfig();

  function toggle() {
    setOpen(!open);
  }

  const FormSchema = z.object({
    amount: z.coerce.number().min(1, t("validation.amountMin")).default(recommendation.points),
    tokenAddress: z.string().min(1, t("validation.tokenAddressRequired")),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      contributorName: recommendation.contributor_name,
      amount: recommendation.points,
    },
  });

  function handleFormSubmission(data: z.infer<typeof FormSchema>) {
    try {
      startTransition(async () => {
        const toastId = toast.loading(t("form.toast.processing"));

        try {
          // Check if selected token is a badge or token
          const isSelectedBadge = community.badges.some((badge) => badge.id === data.tokenAddress);

          // Use different contract function based on token type
          if (isSelectedBadge) {
            const badgeTransaction = await writeContract(config, {
              address: community.id,
              abi: rewardFacetAbi,
              functionName: "mintBadge",
              args: [
                data.tokenAddress as Address,
                recommendation.wallet_address as Address,
                stringToHex(recommendation.reward_id, { size: 32 }),
                stringToHex("MISSION", { size: 32 }),
                stringToHex(recommendation.metadata_uri ?? ""),
              ],
            });

            await waitForTransactionReceipt(config, {
              hash: badgeTransaction,
            });

            toast.success(t("form.toast.badgeSuccess"), { id: toastId });
          } else {
            // Handle ERC20 token minting
            const hash = await writeContract(config, {
              address: community.id,
              abi: rewardFacetAbi,
              functionName: "mintERC20",
              args: [
                data.tokenAddress as Address,
                recommendation.wallet_address as Address,
                parseEther(data.amount.toString()),
                stringToHex(recommendation.reward_id, { size: 32 }),
                stringToHex("MISSION", { size: 32 }),
                stringToHex(recommendation.metadata_uri ?? ""),
              ],
            });

            await waitForTransactionReceipt(config, { hash });
            toast.success(t("form.toast.tokensSuccess"), { id: toastId });

            form.reset();
          }

          // After successful transaction
          toast.dismiss(toastId);

          deleteRecommendation();
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
    <Dialog open={open} onOpenChange={toggle}>
      <DialogTrigger className={buttonVariants()} onClick={toggle}>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("reward")}</DialogTitle>
          <DialogDescription>{t("rewardDescription")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="w-full space-y-4 overflow-y-auto max-h-[calc(85vh-120px)]"
            onSubmit={form.handleSubmit(handleFormSubmission)}
          >
            {/* Receiver Name  */}
            <Label>{t("form.receiverName.label")}</Label>
            <div className={inputVariants({ variant: "disabled" })}>
              {`${recommendation.contributor_name} (${addressSplitter(recommendation.wallet_address)})`}
            </div>
            {/* Evidence Details */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">{t("form.evidence.label")}</h3>
              <EvidenceDetails evidence={recommendation.evidence} />
            </div>
            {/* Impact Description */}
            {recommendation.impact && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">{t("form.impact.label")}</h3>
                <p className="text-sm text-muted-foreground">{recommendation.impact}</p>
              </div>
            )}

            {/* Recommendation Context */}
            {recommendation.metadata_uri && (
              <div className="space-y-2">
                <Label>Recommendation Context</Label>
                <div className="space-y-3 rounded-lg border border-border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mt-1">
                        This context will be stored on-chain to help improve future reward
                        recommendations and maintain transparency.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      type="button"
                      onClick={() =>
                        window.open(
                          recommendation.metadata_uri?.replace("ipfs://", "https://ipfs.io/ipfs/"),
                          "_blank",
                        )
                      }
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <Separator className="my-lg" />
            {/* Reward Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{t("form.rewardAmount.label")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t("form.rewardAmount.placeholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Token and Action Type */}
            <div>
              <FormField
                control={form.control}
                name="tokenAddress"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel>{t("form.token.label")}</FormLabel>
                    <FormControl>
                      <TokenSelector
                        forceModal={true}
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
            </div>
            <div className="flex justify-between gap-2 pt-2">
              <Button type="submit">{t("form.confirmRewardRecommendation")}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
