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

export default function CreateCommunityDialog() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const router = useRouter();

  function toggle() {
    setIsOpen((t) => !t);
  }

  function handleSuccess(communityId: string) {
    router.push(`/communities/${communityId}/overview`);
  }

  return (
    <Dialog open={isOpen} onOpenChange={toggle}>
      <DialogTrigger className={buttonVariants()}>Create Community</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Community</DialogTitle>
          <DialogDescription>Create a new community.</DialogDescription>
        </DialogHeader>
        <CreateCommunityForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
