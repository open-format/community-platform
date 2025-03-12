"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Image from "next/image";

import { usePrivy } from "@privy-io/react-auth";
import { waitForTransactionReceipt, writeContract } from "@wagmi/core";

import { badgeFactoryAbi } from "@/abis/ERC721FactoryFacet";
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
import { stringToHex } from "viem";
import { useConfig } from "wagmi";

interface CreateBadgeFormProps {
  community: Community;
}

export function CreateBadgeForm({ community }: CreateBadgeFormProps) {
  const t = useTranslations("badges.create");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { triggerConfetti } = useConfetti();
  const [shouldRevalidate, setShouldRevalidate] = useState(false);

  useRevalidate(shouldRevalidate);

  const toggle = () => setIsOpen((t) => !t);

  const FormSchema = z.object({
    name: z.string().min(3, t("validation.nameRequired")).max(32, t("validation.nameMaxLength")),
    description: z.string().min(3, t("validation.descriptionRequired")),
    image: z.instanceof(File).refine((file) => file.size <= 1 * 1024 * 1024, {
      message: t("validation.imageSizeExceeded"),
    }),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      description: "",
      image: undefined,
    },
  });
  const config = useConfig();
  const { user } = usePrivy();
  const address = getAddress(user);
  const image = form.watch("image");

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

      const transactionHash = await writeContract(config, {
        address: community.id,
        abi: badgeFactoryAbi,
        functionName: "createERC721WithTokenURI",
        args: [
          data.name,
          "BADGE",
          metadataURI,
          address as `0x${string}`,
          1000,
          stringToHex("Badge", { size: 32 }),
        ],
      });

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
      <DialogTrigger className={buttonVariants()}>{t("title")}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="w-full space-y-4" onSubmit={form.handleSubmit(handleFormSubmission)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{t("fields.name.label")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("fields.name.placeholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                  <p className="text-destructive text-sm">{t("fields.name.immutableWarning")}</p>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{t("fields.description.label")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("fields.description.placeholder")} {...field} />
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
                  <FormLabel>{t("fields.image.label")}</FormLabel>
                  {image && (
                    <Image
                      src={URL.createObjectURL(image)}
                      alt={t("fields.image.altText")}
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
                {t("buttons.creating")}
              </Button>
            ) : (
              <Button type="submit">{t("buttons.create")}</Button>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
