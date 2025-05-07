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
import CreateCommunityForm from "@/forms/create-community-form";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

interface CreateCommunityDialogProps {
  defaultOpen?: boolean;
}

export default function CreateCommunityDialog({ defaultOpen = false }: CreateCommunityDialogProps) {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
  const router = useRouter();
  const params = useParams();
  const chainName = params?.chainName as string;
  const t = useTranslations("communities.create");

  function toggle() {
    setIsOpen((t) => !t);
  }

  function handleSuccess(communityId: string) {
    router.push(`/${chainName}/communities/${communityId}/overview`);
  }

  return (
    <Dialog open={isOpen} onOpenChange={toggle}>
      {!defaultOpen ? (
        <DialogTrigger className={buttonVariants()}>{t("button")}</DialogTrigger>
      ) : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <CreateCommunityForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
