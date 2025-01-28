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

interface CreateCommunityDialogProps {
  defaultOpen?: boolean;
}

export default function CreateCommunityDialog({ defaultOpen = false }: CreateCommunityDialogProps) {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
  const router = useRouter();

  function toggle() {
    setIsOpen((t) => !t);
  }

  function handleSuccess(communityId: string) {
    router.push(`/communities/${communityId}/overview`);
  }

  return (
    <Dialog open={isOpen} onOpenChange={toggle}>
      {!defaultOpen ? <DialogTrigger className={buttonVariants()}>Create Community</DialogTrigger> : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Community</DialogTitle>
          <DialogDescription>Create a new community to start rewarding your community members.</DialogDescription>
        </DialogHeader>
        <CreateCommunityForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
