import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCurrentChain } from "@/hooks/useCurrentChain";
import { ExternalLinkIcon } from "lucide-react";
import Link from "next/link";

interface RewardSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communityId: string;
  transactionHash?: string;
}

export default function RewardSuccessDialog({
  open,
  onOpenChange,
  transactionHash,
  communityId,
}: RewardSuccessDialogProps) {
  const chain = useCurrentChain();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reward Sent Successfully! 🎉</DialogTitle>
        </DialogHeader>
        <DialogDescription className="space-y-4">The reward has been successfully sent to the member</DialogDescription>
        <DialogFooter>
          <Link href={`/communities/${communityId}/overview`} className={buttonVariants()}>
            View in Activity
          </Link>
          {chain?.BLOCK_EXPLORER_URL && transactionHash && (
            <Link
              className={buttonVariants({ variant: "outline" })}
              href={`${chain.BLOCK_EXPLORER_URL}/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Transaction
              <ExternalLinkIcon className="w-4 h-4" />
            </Link>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
