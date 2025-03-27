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
import { getAllRewardsByCommunity } from "@/lib/openformat";
import RewardTypeSelector from "@/components/reward-type-selector";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

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
    rewardType:       z.enum(['Token', 'Badge', 'All']),
    tokenAddress:     z.string(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      startDate:    undefined,
      endDate:      undefined,
      rewardType:   "All",
      tokenAddress: "All",
    },
  });

  async function handleFormSubmission(data: z.infer<typeof FormSchema>) {
    try {
      setIsLoading(true);
      
      const rewards = await getAllRewardsByCommunity(
        community.id,
        data.startDate ? data.startDate.getTime()/1000 : 0,
        data.endDate ? data.endDate.getTime()/1000 : 99999999999,
        data.tokenAddress === 'All' ? null : data.tokenAddress,
        data.rewardType === 'All' ? null : data.rewardType,
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

  const startDateWatch = form.watch("startDate");
  const endDateWatch = form.watch("endDate");

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
                    <Popover modal={true}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-[240px] pl-3 text-left font-normal",!field.value && "text-muted-foreground")}
                          >
                            {field.value ? (format(field.value, "PPP")) : (<span>{t('startDatePlaceholder')}</span>)}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={{after: endDateWatch ?? new Date()}}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>                    
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
                    <Popover modal={true}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-[240px] pl-3 text-left font-normal",!field.value && "text-muted-foreground")}
                          >
                            {field.value ? (format(field.value, "PPP")) : (<span>{t('endDatePlaceholder')}</span>)}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={{before: startDateWatch ?? new Date("1900-01-01")}}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>                    
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
                <FormItem className="col-span-2 flex flex-col gap-2">
                  <FormLabel>{t('rewardTypeLabel')}</FormLabel>
                  <FormControl>
                    <RewardTypeSelector 
                      value={field.value}
                      includeAllOption={true}
                      onChange={field.onChange}
                      onSelectedItemChange={(val) => {
                        form.setValue("tokenAddress", 'All');
                      }}
                    />
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
                      includeAllOption={true}
                      onChange={field.onChange}
                      onTokenTypeChange={(isBadge, value) => {
                        if (value === 'All') {
                          form.setValue("rewardType", 'All');
                        } else if (isBadge) {
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
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
