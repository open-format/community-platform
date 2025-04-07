"use client"

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button, buttonVariants } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useConfetti } from "@/contexts/confetti-context";


export default function RewardDialog() {
  const t = useTranslations('tokens.create');
  const [isOpen, setIsOpen] = useState<boolean>( false );
  const { triggerConfetti } = useConfetti();

  const FormSchema = z.object({
    name: z.string()
      .min(3, t('validation.nameRequired'))
      .max(32, t('validation.nameMaxLength')),
    symbol: z.string().min(3, t('validation.symbolRequired')),
    type: z.enum(["Base", "Point"]),
    initialSupply: z.string().min(0).optional(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      symbol: "",
      type: "Base",
      initialSupply: "",
    },
  });

  const toggle = () => setIsOpen((t) => !t);

  function handleFormSubmission() {
    form.reset();
    toggle();
    triggerConfetti();
  }

  return (
    <Dialog open={isOpen} onOpenChange={toggle}>
      <DialogTrigger className={buttonVariants()}>{t('title')}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="w-full space-y-4" onSubmit={form.handleSubmit(handleFormSubmission)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{t('fields.name.label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('fields.name.placeholder')} {...field} />
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
                  <FormLabel>{t('fields.symbol.label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('fields.symbol.placeholder')} {...field} />
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
                    <FormLabel>{t('fields.type.label')}</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('fields.type.tooltip.erc20')}</p>
                          <p>{t('fields.type.tooltip.points')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('fields.type.placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Base">{t('fields.type.options.erc20')}</SelectItem>
                        <SelectItem value="Point">{t('fields.type.options.points')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/*{tokenType === "Base" && (*/}
            {/*  <FormField*/}
            {/*    control={form.control}*/}
            {/*    name="initialSupply"*/}
            {/*    render={({ field }) => (*/}
            {/*      <FormItem className="flex-1">*/}
            {/*        <div className="flex items-center gap-2">*/}
            {/*          <FormLabel>{t('fields.initialSupply.label')}</FormLabel>*/}
            {/*          <TooltipProvider>*/}
            {/*            <Tooltip>*/}
            {/*              <TooltipTrigger asChild>*/}
            {/*                <HelpCircle className="h-4 w-4 text-muted-foreground" />*/}
            {/*              </TooltipTrigger>*/}
            {/*              <TooltipContent>*/}
            {/*                <p>{t('fields.initialSupply.tooltip.line1')}</p>*/}
            {/*                <p>{t('fields.initialSupply.tooltip.line2')}</p>*/}
            {/*              </TooltipContent>*/}
            {/*            </Tooltip>*/}
            {/*          </TooltipProvider>*/}
            {/*        </div>*/}
            {/*        <FormControl>*/}
            {/*          <Input type="number" placeholder={t('fields.initialSupply.placeholder')} {...field} />*/}
            {/*        </FormControl>*/}
            {/*        <FormMessage />*/}
            {/*      </FormItem>*/}
            {/*    )}*/}
            {/*  />*/}
            {/*)}*/}
            <p className="text-destructive text-sm">{t('warnings.immutable')}</p>
            {form.formState.isSubmitting ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('buttons.creating')}
              </Button>
            ) : (
              <Button type="submit">{t('buttons.create')}</Button>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}