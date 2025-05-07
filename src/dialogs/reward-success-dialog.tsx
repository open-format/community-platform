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
import { useTranslations } from 'next-intl';
import { useParams } from "next/navigation";

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
  const params = useParams();
  const chainName = params?.chainName as string;
  const t = useTranslations('rewards.success');
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        <DialogDescription className="space-y-4">{t('description')}</DialogDescription>
        <DialogFooter>
          <Link href={`/${chainName}/communities/${communityId}/overview`} className={buttonVariants()}>
            {t('viewActivity')}
          </Link>
          {chain?.BLOCK_EXPLORER_URL && transactionHash && (
            <Link
              className={buttonVariants({ variant: "outline" })}
              href={`${chain.BLOCK_EXPLORER_URL}/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('viewTransaction')}
              <ExternalLinkIcon className="w-4 h-4" />
            </Link>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
