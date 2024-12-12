"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import TokenSelector from "@/components/token-selector";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as z from "zod";

const rewardsFormSchema = z.object({
  user: z.string().min(1, "User handle is required"),
  tokenAddress: z.string().min(1, "Token is required"),
  tokenType: z.enum(["token", "badge"]),
  amount: z.coerce.number().min(10 ** -18, "Amount must be at least 0.000000000000000001"),
  description: z.string().optional(),
});

type RewardsFormValues = z.infer<typeof rewardsFormSchema>;

export default function RewardsForm({ community }: { community: Community }) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<RewardsFormValues>({
    resolver: zodResolver(rewardsFormSchema),
    defaultValues: {
      user: "",
      tokenAddress: undefined,
      amount: undefined,

      tokenType: "token" as const,
    },
  });

  function onSubmit(data: RewardsFormValues) {
    startTransition(async () => {
      // @TODO: Implement reward logic
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reward User</CardTitle>
        <CardDescription>Send tokens or badges</CardDescription>
      </CardHeader>
      <CardContent>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="user"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Handle</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter user handle" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tokenType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reward Type</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reward type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="token">Token</SelectItem>
                        <SelectItem value="badge">Badge</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tokenAddress"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2">
                  <FormLabel>Token</FormLabel>
                  <FormControl>
                    <TokenSelector
                      tokens={community.tokens}
                      badges={[]}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter amount" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Processing..." : "Reward"}
            </Button>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
