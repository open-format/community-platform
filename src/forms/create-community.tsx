"use client";

import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { startTransition, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { appFactoryAbi } from "@/abis/AppFactory";
import { erc20FactoryAbi } from "@/abis/ERC20FactoryFacet";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { chains } from "@/constants/chains";
import { useConfetti } from "@/contexts/confetti-context";
import { createCommunity } from "@/db/queries/communities";
import { getEventLog } from "@/helpers/contract";
import { revalidate } from "@/lib/openformat";
import { sanitizeString } from "@/lib/utils";
import { usePrivy } from "@privy-io/react-auth";
import { waitForTransactionReceipt, writeContract } from "@wagmi/core";
import { Loader2 } from "lucide-react";
import { type Address, parseEther, stringToHex } from "viem";
import { useConfig } from "wagmi";

export default function CreateCommunityForm() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { triggerConfetti } = useConfetti();
  const config = useConfig();
  const { user } = usePrivy();

  function toggle() {
    setIsOpen((t) => !t);
  }

  const FormSchema = z.object({
    name: z.string().min(3).max(32),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
    },
  });

  function handleFormSubmission(data: z.infer<typeof FormSchema>) {
    setIsSubmitting(true);
    startTransition(async () => {
      try {
        const sanitizedName = sanitizeString(data.name, { replaceSpacesWith: "-" });
        const transactionHash = await writeContract(config, {
          address: chains.arbitrumSepolia.APP_FACTORY_ADDRESS,
          abi: appFactoryAbi,
          functionName: "create",
          args: [stringToHex(sanitizedName, { size: 32 }), user?.wallet?.address as Address],
        });

        const transactionReceipt = await waitForTransactionReceipt(config, { hash: transactionHash });
        const communityId = await getEventLog(transactionReceipt, appFactoryAbi, "Created");

        if (!communityId) {
          throw new Error("Failed to get community id");
        }

        await createCommunity(communityId, data.name);

        const pointsTransactionHash = await writeContract(config, {
          address: communityId,
          abi: erc20FactoryAbi,
          functionName: "createERC20",
          args: [data.name, "Points", 18, parseEther("0"), stringToHex("Point", { size: 32 })],
        });

        const pointsTransactionHashReceipt = await waitForTransactionReceipt(config, { hash: pointsTransactionHash });

        console.log({ communityId, pointsTransactionHashReceipt });

        form.reset();
        toggle();
        triggerConfetti();
        revalidate();
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={toggle}>
      <DialogTrigger className={buttonVariants()}>Create Community</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Community</DialogTitle>
          <DialogDescription>Create a new community.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="w-full space-y-4" onSubmit={form.handleSubmit(handleFormSubmission)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name" {...field} />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    The name of your community. Please note, due to the immutable nature of the blockchain this value
                    can not be changed.
                  </FormDescription>
                </FormItem>
              )}
            />
            {isSubmitting ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating community...
              </Button>
            ) : (
              <Button type="submit">Create Community</Button>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
