"use client";

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
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";

type EvidenceItem = {
  title: string;
  url: string;
};

type ConfirmReward = {
  amount: number;
};

type RewardDialogProps = {
  contributorName: string;
  evidence: EvidenceItem[];
  impact: string;
  suggestedAmount?: number;
  submitting?: boolean;
  onClose: () => void;
  onConfirm: (data: ConfirmReward) => void;
};

// Evidence Details Component
function EvidenceDetails({ evidence }: { evidence: EvidenceItem[] }) {
  if (!evidence || evidence.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No evidence provided</p>
    );
  }

  return (
    <div className="space-y-2">
      {evidence.map((item, index) => (
        <Card key={index} className="bg-muted/50">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
          </CardHeader>
          <CardFooter className="p-3 pt-0">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline flex items-center gap-1"
            >
              View Evidence <ExternalLink className="h-3 w-3" />
            </a>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default function RewardDialog({
  contributorName,
  evidence,
  impact,
  suggestedAmount = 100,
  submitting,
  onClose,
  onConfirm,
}: RewardDialogProps) {
  const t = useTranslations("tokens.create");

  const FormSchema = z.object({
    contributorName: z
      .string()
      .min(3, t("validation.nameRequired"))
      .max(32, t("validation.nameMaxLength")),
    amount: z.coerce
      .number()
      .min(1, "Amount must be at least 1")
      .default(suggestedAmount),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      contributorName,
      amount: suggestedAmount,
    },
  });

  const onOpenChange = (opened: boolean) => {
    if (!opened) {
      onClose();
    }
  };

  function handleFormSubmission() {
    onConfirm(form.getValues());
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogTrigger className={buttonVariants()} onClick={onClose}>
        {t("title")}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Reward
            {/* {t("title")} */}
          </DialogTitle>
          <DialogDescription>
            Reward a community member for their contribution.
            {/* {t("description")} */}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="w-full space-y-4"
            onSubmit={form.handleSubmit(handleFormSubmission)}
          >
            {/* Receiver Name  */}
            <FormField
              control={form.control}
              name="contributorName"
              disabled
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Receiver Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("fields.name.placeholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Reward Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Reward Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter reward amount"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Evidence Details */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Evidence</h3>
              <EvidenceDetails evidence={evidence} />
            </div>

            {/* Impact Description */}
            {impact && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Impact</h3>
                <p className="text-sm text-muted-foreground">{impact}</p>
              </div>
            )}
            <div className="flex justify-between gap-2 pt-2">
              {submitting ? (
                <Button disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirming Reward...
                </Button>
              ) : (
                <Button type="submit">Confirm Reward</Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
