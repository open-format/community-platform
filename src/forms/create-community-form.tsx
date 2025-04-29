"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from "next/navigation";

import { appFactoryAbi } from "@/abis/AppFactory";
import { erc20FactoryAbi } from "@/abis/ERC20FactoryFacet";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useConfetti } from "@/contexts/confetti-context";
import { createCommunity, updateCommunity } from "@/db/queries/communities";
import { getEventLog } from "@/helpers/contract";
import { handleViemError } from "@/helpers/errors";
import { useCurrentChain } from "@/hooks/useCurrentChain";
import { revalidate } from "@/lib/openformat";
import { cn, getAddress } from "@/lib/utils";
import { usePrivy } from "@privy-io/react-auth";
import { simulateContract, waitForTransactionReceipt, writeContract } from "@wagmi/core";
import { Loader2 } from "lucide-react";
import { startTransition, useState } from "react";
import { toast } from "sonner";
import { type Address, BaseError, parseEther, stringToHex } from "viem";
import { useConfig } from "wagmi";

interface CreateCommunityFormProps {
  onSuccess?: (communityId: string) => void;
}

export default function CreateCommunityForm({ onSuccess }: CreateCommunityFormProps) {
  const t = useTranslations('createCommunity.form');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { triggerConfetti } = useConfetti();
  const config = useConfig();
  const { user } = usePrivy();
  const address = getAddress(user);
  const router = useRouter();
  const params = useParams();
  const chainName = params?.chainName as string;
  const chain = useCurrentChain();

  const FormSchema = z.object({
    name: z.string()
      .min(3, t('validation.nameRequired'))
      .max(32, t('validation.nameMaxLength')),
    createPoints: z.boolean().optional(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      createPoints: true,
    },
  });

  function simulateCreateCommunity(name: string) {
    startTransition(async () => {
      if (!chain) {
        throw new Error(t('validation.chainNotFound'));
      }

      await simulateContract(config, {
        address: chain.APP_FACTORY_ADDRESS,
        abi: appFactoryAbi,
        functionName: "create",
        args: [stringToHex(name, { size: 32 }), address as Address],
      })
        .then((result) => {
          console.log({ result });
        })
        .catch((error) => {
          if (error.metaMessages?.[0]?.includes("nameAlreadyUsed")) {
            form.setError("name", {
              type: "manual",
              message: t('validation.nameInUse'),
            });
          } else {
            form.setError("name", {
              type: "manual",
              message: error.message,
            });
          }
        });
    });
  }

  function handleFormSubmission(data: z.infer<typeof FormSchema>) {
    setIsSubmitting(true);
    let loadingToastId: string | number;
    let communityId: Address | null = null;
    startTransition(async () => {
      try {
        loadingToastId = toast.loading(t('toast.creating.title'), {
          description: t('toast.creating.description'),
        });

        if (!chain) {
          toast.error(t('toast.error.title'), {
            description: t('toast.error.chainNotFound'),
          });
          return;
        }

        const { request } = await simulateContract(config, {
          address: chain.APP_FACTORY_ADDRESS,
          abi: appFactoryAbi,
          functionName: "create",
          args: [stringToHex(data.name, { size: 32 }), address as Address],
        });

        const transactionHash = await writeContract(config, request);

        const transactionReceipt = await waitForTransactionReceipt(config, {
          hash: transactionHash,
        });
        communityId = await getEventLog(transactionReceipt, appFactoryAbi, "Created");

        if (!communityId) {
          throw new Error(t('toast.error.communityIdFailed'));
        }

        await createCommunity(communityId, data.name, chain.id);

        let pointsCommunityId = null;
        if (data.createPoints) {
          toast.message(t('toast.creatingPoints.title'), {
            description: t('toast.creatingPoints.description'),
          });

          const { request: pointsRequest } = await simulateContract(config, {
            address: communityId,
            abi: erc20FactoryAbi,
            functionName: "createERC20",
            args: [data.name, "Points", 18, parseEther("0"), stringToHex("Point", { size: 32 })],
          });

          const pointsTransactionHash = await writeContract(config, pointsRequest);

          const pointsTransactionReceipt = await waitForTransactionReceipt(config, { hash: pointsTransactionHash });
          pointsCommunityId = await getEventLog(pointsTransactionReceipt, erc20FactoryAbi, "Created");
        }

        await updateCommunity(communityId, {
          token_to_display: pointsCommunityId,
        });

        toast.success(t('toast.success.title'), {
          description: t('toast.success.description'),
        });

        form.reset();
        triggerConfetti();
        revalidate();
      } catch (err) {
        if (err instanceof BaseError) {
          return handleViemError(err);
        }
        toast.error(t('toast.error.title'), {
          description: t('toast.error.generic'),
        });
      } finally {
        setIsSubmitting(false);
        if (loadingToastId) {
          toast.dismiss(loadingToastId);
        }

        if (communityId) {
          router.push(`/${chainName}/communities/${communityId}`);
        }
      }
    });
  }

  return (
    <Form {...form}>
      <form className={cn("w-full space-y-4")} onSubmit={form.handleSubmit(handleFormSubmission)}>
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>{t('fields.name.label')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('fields.name.placeholder')}
                  {...field}
                  onBlur={() => {
                    field.onChange(field.value.toLowerCase());
                    simulateCreateCommunity(field.value.toLowerCase());
                  }}
                  onChange={(e) => {
                    field.onChange(e);
                    form.clearErrors("name");
                  }}
                />
              </FormControl>
              <FormMessage />
              <FormDescription>{t('fields.name.description')}</FormDescription>
            </FormItem>
          )}
        />

        {/* Create Points */}
        <FormField
          control={form.control}
          name="createPoints"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">{t('fields.points.label')}</FormLabel>
                <FormDescription>{t('fields.points.description')}</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        {isSubmitting ? (
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('buttons.creating')}
          </Button>
        ) : (
          <Button type="submit">{t('buttons.create')}</Button>
        )}
      </form>
    </Form>
  );
}
