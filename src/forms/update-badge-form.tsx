"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTranslations } from 'next-intl';

import { Button, buttonVariants } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Image from "next/image";

import { usePrivy } from "@privy-io/react-auth";
import { simulateContract, waitForTransactionReceipt, writeContract } from "@wagmi/core";

import { badgeAbi } from "@/abis/ERC721Badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useConfetti } from "@/contexts/confetti-context";
import { useRevalidate } from "@/hooks/useRevalidate";
import { uploadFileToIPFS, uploadMetadata } from "@/lib/thirdweb";
import { getAddress } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import type { Address } from "viem";
import { useConfig } from "wagmi";

interface UpdateBadgeFormProps {
  badge: Badge;
  metadata: {
    name: string;
    description: string;
    image: string;
  };
}

export function UpdateBadgeForm({ badge, metadata }: UpdateBadgeFormProps) {
  const t = useTranslations('badges.update');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { triggerConfetti } = useConfetti();
  const [shouldRevalidate, setShouldRevalidate] = useState(false);

  const FormSchema = z.object({
    name: z.string()
      .min(3, t('validation.nameRequired'))
      .max(32, t('validation.nameMaxLength')),
    description: z.string()
      .min(3, t('validation.descriptionRequired')),
    image: z.any(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: badge.name,
      description: metadata.description,
    },
  });
  const config = useConfig();
  const { user } = usePrivy();
  const address = getAddress(user);
  const image = form.watch("image");

  useRevalidate(shouldRevalidate);

  const toggle = () => setIsOpen((t) => !t);

  async function handleFormSubmission(data: z.infer<typeof FormSchema>) {
    try {
      const formData = new FormData();
      formData.append("file", data.image);

      const image = await uploadFileToIPFS(formData);

      const metadata = {
        name: data.name,
        description: data.description,
        image: image,
      };

      const metadataURI = await uploadMetadata(metadata);

      const { request } = await simulateContract(config, {
        account: address as Address,
        address: badge.id as Address,
        abi: badgeAbi,
        functionName: "setBaseURI",
        args: [metadataURI],
      });

      const transactionHash = await writeContract(config, request);

      await waitForTransactionReceipt(config, { hash: transactionHash });

      form.reset();
      toggle();
      triggerConfetti();
      setShouldRevalidate(true);
    } catch (e: any) {
      console.log(e.message);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={toggle}>
      <DialogTrigger className={buttonVariants({ variant: "outline" })}>
        {t('buttons.trigger')}
      </DialogTrigger>
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
              name="description"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{t('fields.description.label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('fields.description.placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>{t('fields.image.label')}</FormLabel>
                  {image && (
                    <Image
                      src={URL.createObjectURL(image)}
                      alt={t('fields.image.alt')}
                      width={125}
                      height={125}
                      className="rounded-md object-cover"
                    />
                  )}
                  <FormControl>
                    <Input
                      {...fieldProps}
                      type="file"
                      accept="image/*"
                      onChange={(e) => onChange(e.target.files && e.target.files[0])}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.formState.isSubmitting ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('buttons.updating')}
              </Button>
            ) : (
              <Button type="submit">{t('buttons.submit')}</Button>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
