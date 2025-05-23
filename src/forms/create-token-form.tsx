"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { simulateContract, waitForTransactionReceipt, writeContract } from "@wagmi/core";

import { appFactoryAbi } from "@/abis/AppFactory";
import { erc20FactoryAbi } from "@/abis/ERC20FactoryFacet";
import { updateCommunity } from "@/app/actions/communities/update";
import NetworkSelector from "@/components/network-selector";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { ChainName } from "@/constants/chains";
import { useConfetti } from "@/contexts/confetti-context";
import { getEventLog } from "@/helpers/contract";
import { handleViemError } from "@/helpers/errors";
import { useCurrentChain } from "@/hooks/useCurrentChain";
import { useRevalidate } from "@/hooks/useRevalidate";
import { getAddress } from "@/lib/utils";
import { usePrivy } from "@privy-io/react-auth";
import { HelpCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { type Address, BaseError, parseEther, stringToHex } from "viem";
import { useConfig, useSwitchChain } from "wagmi";

interface CreateTokenFormProps {
  community: Community;
}

export function CreateTokenForm({ community }: CreateTokenFormProps) {
  const t = useTranslations("tokens.create");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { triggerConfetti } = useConfetti();
  const { switchChain } = useSwitchChain();
  const { user } = usePrivy();
  const address = getAddress(user);
  const chain = useCurrentChain();

  const [shouldRevalidate, setShouldRevalidate] = useState(false);
  const { isRevalidating } = useRevalidate(shouldRevalidate);

  useEffect(() => {
    let toastId: string | number | undefined;

    if (isRevalidating) {
      toastId = toast.loading("Fetching new tokens...", {
        description: "Please wait while we fetch the new tokens...",
      });
    } else if (toastId) {
      toast.dismiss(toastId);
    }

    return () => {
      if (toastId) toast.dismiss(toastId);
    };
  }, [isRevalidating]);

  const FormSchema = z.object({
    name: z.string().min(3, t("validation.nameRequired")).max(32, t("validation.nameMaxLength")),
    symbol: z.string().min(3, t("validation.symbolRequired")),
    type: z.enum(["Base", "Point"]),
    initialSupply: z.string().min(0).optional(),
  });

  const toggle = () => setIsOpen((t) => !t);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      symbol: "",
      type: "Base",
      initialSupply: "",
    },
  });
  const config = useConfig();

  const tokenType = form.watch("type");

  async function handleFormSubmission(data: z.infer<typeof FormSchema>) {
    try {
      const chainId = community.communityContractChainId;
      const appId = community.communityContractAddress;
      let communityId: Address | null = appId || null;

      if (!chain) {
        throw new Error(t("validation.chainNotFound"));
      }

      // if appID exist switch to chainId
      // if appId does not exist, create app
      if (!appId) {
        switchChain({ chainId: chain.id });

        const { request } = await simulateContract(config, {
          address: chain.APP_FACTORY_ADDRESS,
          abi: appFactoryAbi,
          functionName: "create",
          args: [stringToHex(community.name, { size: 32 }), address as Address],
        });

        const transactionHash = await writeContract(config, request);

        const transactionReceipt = await waitForTransactionReceipt(config, {
          hash: transactionHash,
        });

        communityId = await getEventLog(transactionReceipt, appFactoryAbi, "Created");

        await updateCommunity(community.id, {
          communityContractAddress: communityId?.toLowerCase() as Address,
          communityContractChainId: chain.id,
        });
      }

      switchChain({ chainId: chainId as number });

      const transactionHash = await writeContract(config, {
        address: communityId,
        abi: erc20FactoryAbi,
        functionName: "createERC20",
        args: [
          data.name,
          data.symbol,
          18,
          parseEther(data.type === "Point" ? "0" : data.initialSupply || "0"),
          stringToHex(data.type, { size: 32 }),
        ],
      });
      await waitForTransactionReceipt(config, { hash: transactionHash });

      toast.success(t("toast.success.title"), {
        description: t("toast.success.description"),
      });

      form.reset();
      toggle();
      triggerConfetti();
      setShouldRevalidate(true);
    } catch (err) {
      if (err instanceof BaseError) {
        return handleViemError(err);
      }
      toast.error(t("toast.error.title"), {
        description: t("toast.error.description"),
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={toggle}>
      <DialogTrigger className={buttonVariants()}>{t("title")}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="w-full space-y-4" onSubmit={form.handleSubmit(handleFormSubmission)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{t("fields.name.label")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("fields.name.placeholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{t("fields.symbol.label")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("fields.symbol.placeholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>{t("fields.type.label")}</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t("fields.type.tooltip.erc20")}</p>
                          <p>{t("fields.type.tooltip.points")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("fields.type.placeholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Base">{t("fields.type.options.erc20")}</SelectItem>
                        <SelectItem value="Point">{t("fields.type.options.points")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!community.communityContractAddress && (
              <FormItem>
                <FormLabel>{t("fields.network.label")}</FormLabel>
                <FormControl>
                  <NetworkSelector
                    onValueChange={(chainName) => {
                      form.setValue("chainName", chainName as ChainName);
                    }}
                  />
                </FormControl>
                <FormDescription>{t("fields.network.description")}</FormDescription>
              </FormItem>
            )}
            {tokenType === "Base" && (
              <FormField
                control={form.control}
                name="initialSupply"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <div className="flex items-center gap-2">
                      <FormLabel>{t("fields.initialSupply.label")}</FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t("fields.initialSupply.tooltip.line1")}</p>
                            <p>{t("fields.initialSupply.tooltip.line2")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t("fields.initialSupply.placeholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <p className="text-destructive text-sm">{t("warnings.immutable")}</p>
            {form.formState.isSubmitting ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("buttons.creating")}
              </Button>
            ) : (
              <Button type="submit">{t("buttons.create")}</Button>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
