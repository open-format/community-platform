"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button, buttonVariants } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { waitForTransactionReceipt, writeContract } from "@wagmi/core";

import { erc20FactoryAbi } from "@/abis/ERC20FactoryFacet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useConfetti } from "@/contexts/confetti-context";
import { revalidate } from "@/lib/openformat";
import { HelpCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { parseEther, stringToHex } from "viem";
import { useConfig } from "wagmi";

const FormSchema = z.object({
  name: z.string().min(3).max(32),
  symbol: z.string().min(3),
  type: z.enum(["Base", "Point"]),
  initialSupply: z.string().min(0).optional(),
});

interface CreateTokenFormProps {
  community: Community;
}

export function CreateTokenForm({ community }: CreateTokenFormProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { triggerConfetti } = useConfetti();

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
      const transactionHash = await writeContract(config, {
        address: community.id,
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

      const receipt = await waitForTransactionReceipt(config, { hash: transactionHash });

      form.reset();
      toggle();
      triggerConfetti();
      revalidate();
    } catch (e: any) {
      console.log(e.message);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={toggle}>
      <DialogTrigger className={buttonVariants()}>Create Token</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Token</DialogTitle>
          <DialogDescription>Create a new token for your community.</DialogDescription>
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
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Symbol</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. ETH, USDC, VIBES" {...field} />
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
                    <FormLabel>Type</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>ERC20: Standard fungible token</p>
                          <p>Points: Non-transferable community points</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select token type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Base">ERC20</SelectItem>
                        <SelectItem value="Point">Points</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {tokenType === "Base" && (
              <FormField
                control={form.control}
                name="initialSupply"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <div className="flex items-center gap-2">
                      <FormLabel>Initial Supply</FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>The initial supply of the token.</p>
                            <p>This is the amount of tokens that will be minted to your wallet.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <p className="text-destructive text-sm">Tokens are immutable and cannot be changed.</p>
            {form.formState.isSubmitting ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Token...
              </Button>
            ) : (
              <Button type="submit">Create Token</Button>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
