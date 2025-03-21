"use client";

import { useTranslations } from 'next-intl';


import {
  Dialog,
  DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Progress } from './ui/progress';

interface RewardsProgressDialogProps {
  progressInfo:  BatchRewardProgressInfo;
  open: boolean;
}

export function RewardsProgressDialog({ progressInfo, open }: RewardsProgressDialogProps) {
  const t = useTranslations('batchRewards');

  return (
    <Dialog open={open}>
      <DialogContent
        onCloseAutoFocus={(e) => e.preventDefault() } 
        onEscapeKeyDown={(e) => e.preventDefault()} 
        onPointerDownOutside={(e) => e.preventDefault()} 
        hideCloseButton={true}
      >
          <DialogHeader>
            <DialogTitle>{t('progress.title')}</DialogTitle>
          </DialogHeader>
        <div>
          <p>{t('progress.success', { success: progressInfo.success })}</p>
          <p>{t('progress.failed', { failed: progressInfo.failed })}</p>
          <p>{t('progress.total', { total: progressInfo.total })}</p>
        </div>
        <Progress value={100*(progressInfo.failed+progressInfo.success)/progressInfo.total} className="w-full h-3" />
      </DialogContent>
    </Dialog>
  );
}
