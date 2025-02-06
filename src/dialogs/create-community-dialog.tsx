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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from 'next-intl';

interface CreateCommunityDialogProps {
  defaultOpen?: boolean;
}

export default function CreateCommunityDialog({ defaultOpen = false }: CreateCommunityDialogProps) {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
  const router = useRouter();
  const t = useTranslations('communities.create');

  function toggle() {
    setIsOpen((t) => !t);
  }

  function handleSuccess(communityId: string) {
    router.push(`/communities/${communityId}/overview`);
  }

  return (
    <Dialog open={isOpen} onOpenChange={toggle}>
      {!defaultOpen ? <DialogTrigger className={buttonVariants()}>{t('button')}</DialogTrigger> : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <CreateCommunityForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
