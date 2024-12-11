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
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { chains } from "@/constants/chains";
import { usePrivy } from "@privy-io/react-auth";
import { writeContract } from "@wagmi/core";
import { Loader2 } from "lucide-react";
import { type Address, stringToHex } from "viem";
import { useConfig } from "wagmi";

export default function CreateCommunityForm() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
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
  });

  const {
    formState: { isSubmitting },
  } = form;

  function handleFormSubmission(data: z.infer<typeof FormSchema>) {
    // @TODO: Handle multichain support
    startTransition(async () => {
      await writeContract(config, {
        address: chains.arbitrumSepolia.APP_FACTORY_ADDRESS,
        abi: appFactoryAbi,
        functionName: "create",
        args: [stringToHex(data.name, { size: 32 }), user?.wallet?.address as Address],
      })
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.error(err);
        });
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
