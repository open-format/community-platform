"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTranslations } from 'next-intl';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useRevalidate } from "@/hooks/useRevalidate";
import { useState } from "react";
import TokenSelector from "@/components/token-selector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllRewardsByCommunity } from "@/lib/openformat";

interface ActivityExportFormProps {
  open: boolean;
  close: () => void;
  community: Community;
}


export function ActivityExportForm({ open, close, community }: ActivityExportFormProps) {
  const t                                         = useTranslations('overview.exportForm');
  const [shouldRevalidate, setShouldRevalidate]   = useState(false);
  const [isLoading, setIsLoading]                 = useState(false);

  useRevalidate(shouldRevalidate);

  const FormSchema = z.object({
    startDate:        z.date().optional(),
    endDate:          z.date().optional(),
    rewardType:       z.string().optional(),
    tokenAddress:     z.string().optional(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      startDate:    undefined,
      endDate:      undefined,
      rewardType:   "",
      tokenAddress: "",
    },
  });

  async function handleFormSubmission(data: z.infer<typeof FormSchema>) {
    try {
      setIsLoading(true);
      
      const rewards = await getAllRewardsByCommunity(
        community.id,
        data.startDate ? data.startDate.getTime()/1000 : 0,
        data.endDate ? data.endDate.getTime()/1000 : 99999999999,
        data.tokenAddress ?? null,
        data.rewardType ?? null
      )

      const blob = new Blob([rewards], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'activities.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsLoading(false);

      close();            
      form.reset();
      setShouldRevalidate(true);
      toast.success(t('exportSuccess'))
    } catch (e: any) {
      console.log(e.message);
      toast.error(t('exportSuccess'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="w-full max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="w-full space-y-8" onSubmit={form.handleSubmit(handleFormSubmission)}>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 items-end">
              {/* Start Date */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <div className="flex items-center gap-2">
                      <FormLabel>{t('startDateLabel')}</FormLabel>
                    </div>
                    <FormControl>
                    <DatePicker
                      selected={field.value}
                      onChange={field.onChange}
                      placeholderText="Start Date"
                      isClearable
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      selectsStart
                      startDate={field.value}
                      endDate={form.getValues("endDate")}
                      startOpen={false}
                      disabled={isLoading}
                    />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* End Date */}
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <div className="flex items-center gap-2">
                      <FormLabel>{t('endDateLabel')}</FormLabel>
                    </div>
                    <FormControl>
                    <DatePicker
                      selected={field.value}
                      onChange={field.onChange}
                      placeholderText="End Date"
                      isClearable
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      selectsEnd
                      startDate={form.getValues("startDate")}
                      endDate={field.value}
                      minDate={form.getValues("startDate")}
                      disabled={isLoading}
                    />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Reward Type */}
            <FormField
              control={form.control}
              name="rewardType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <p>{t('rewardTypeLabel')}</p>
                  </FormLabel>
                  <FormControl>
                    <Select
                    key={'custom-key' + field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue("tokenAddress", undefined);
                      }}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('rewardTypePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Badge">{t('rewardTypeBadge')}</SelectItem>
                        <SelectItem value="Token">{t('rewardTypeToken')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Token */}
            <FormField
              control={form.control}
              name="tokenAddress"
              render={({ field }) => (
                <FormItem className="col-span-2 flex flex-col gap-2">
                  <FormLabel>{t('tokenLabel')}</FormLabel>
                  <FormControl>
                    <TokenSelector
                      tokens={community.tokens}
                      badges={community.badges}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onTokenTypeChange={(isBadge) => {
                        if (isBadge) {
                          form.setValue("rewardType", 'Badge');
                        } else {
                          form.setValue("rewardType", 'Token');
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit"
              disabled={isLoading}
            >{isLoading ? t('exportingLabel') : t('exportLabel')}</Button>
            <Button 
              disabled={isLoading}
              variant={"secondary"}
              onClick={(e) => {
                e.preventDefault();
                form.reset();
                setShouldRevalidate(true);          
              }}
            >
              {t('clearLabel')}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
