import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { chains } from "@/constants/chains";
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reward Sent Successfully! 🎉</DialogTitle>
        </DialogHeader>
        <DialogDescription className="space-y-4">
          <p>The reward has been successfully sent to the member.</p>
        </DialogDescription>
        <DialogFooter>
          <Link href={`/communities/${communityId}/overview`} className={buttonVariants()}>
            View in Activity
          </Link>
          <Link
            className={buttonVariants({ variant: "outline" })}
            href={`${chains.arbitrumSepolia.BLOCK_EXPLORER_URL}/tx/${transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Transaction
            <ExternalLinkIcon className="w-4 h-4" />
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
