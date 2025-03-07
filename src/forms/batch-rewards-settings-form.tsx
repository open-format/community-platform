"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTranslations } from 'next-intl';

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";


import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRevalidate } from "@/hooks/useRevalidate";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface BatchRewardsSettingsFormProps {
  settings:  BatchRewardSettings;
  open: boolean;
  close: () => void;
  setSettings: (arg0: BatchRewardSettings) => void;
}


export function BatchRewardsSettingsForm({ settings, open, close, setSettings }: BatchRewardsSettingsFormProps) {
  const t = useTranslations('batchRewards');
  const [shouldRevalidate, setShouldRevalidate] = useState(false);
  useRevalidate(shouldRevalidate);

  const FormSchema = z.object({
    header:             z.boolean(),
    multicall:          z.boolean(),
    delimiter:          z.enum(["Auto", "Comma", "Semicolon", "Other"]),
    delimiterOther:     z.string().optional(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      header:           settings.header,
      multicall:        settings.multicall,
      delimiter:        getDelimiterType(settings.delimiter),
      delimiterOther:   settings.delimiter ?? "",
    },
  });

  const delimiterType = form.watch("delimiter");

  async function handleFormSubmission(data: z.infer<typeof FormSchema>) {
    try {
      let settingsDelimiter = "";
      switch (data.delimiter) {
        case "Auto":
          settingsDelimiter = "";
          break;
        case "Comma":
          settingsDelimiter = ",";
          break;
        case "Semicolon":
          settingsDelimiter = ";";
          break;
        case "Other":
          settingsDelimiter = data.delimiterOther ?? "";
          break;
      }
      setSettings({
        header:     data.header,
        multicall:  data.multicall,
        delimiter:  settingsDelimiter,
      });

      console.log('OldSettings', settings);
      console.log('NewSettings', {
        header: data.header,
        multicall: data.multicall,
        delimiter: settingsDelimiter,
        delimiterForm: data.delimiter,
      });

      
      close();            
      form.reset();
      setShouldRevalidate(true);
    } catch (e: any) {
      console.log(e.message);
    }
  }

  function getDelimiterType(delimiter: string|null|undefined) {
    return (!delimiter || delimiter === "") ? "Auto"
      : delimiter === "," ? "Comma"
      :  delimiter === ";" ? "Semicolon"
      :  "Other";
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('settings.title')}</DialogTitle>
          <DialogDescription>{t('settings.description')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="w-full space-y-4" onSubmit={form.handleSubmit(handleFormSubmission)}>
            <FormField
              control={form.control}
              name="header"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                    <FormLabel className="text-base">{t('settings.fields.header.label')}</FormLabel>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="delimiter"
              render={({ field }) => (
                <FormItem>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2">
                          <FormLabel>{t('settings.fields.delimiter.label')}</FormLabel>
                          <HelpCircle className="h-4 w-4 text-muted-foreground"/>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="start" className="max-w-prose space-y-2">
                        <p>{t('settings.fields.delimiter.tooltip')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('settings.fields.delimiter.placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Auto">{t('settings.fields.delimiter.options.auto')}</SelectItem>
                        <SelectItem value="Comma">{t('settings.fields.delimiter.options.comma')}</SelectItem>
                        <SelectItem value="Semicolon">{t('settings.fields.delimiter.options.semicolon')}</SelectItem>
                        <SelectItem value="Other">{t('settings.fields.delimiter.options.other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {delimiterType === "Other" && (
              <FormField
                control={form.control}
                name="delimiterOther"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <div className="flex items-center gap-2">
                      <FormLabel>{t('settings.fields.delimiter.otherLabel')}</FormLabel>
                    </div>
                    <FormControl>
                      <Input placeholder={t('settings.fields.delimiter.otherPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="multicall"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                    <FormLabel className="text-base">{t('settings.fields.multicall.label')}</FormLabel>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit">{t('settings.saveLabel')}</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
