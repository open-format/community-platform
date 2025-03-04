import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { desanitizeString } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface BatchRewardListProps {
  rewards: BatchRewardEntry[];
}

export default function BatchRewardList({ rewards }: BatchRewardListProps) {
  const t = useTranslations('batchRewards');
  const FIRST_ERRORS_COUNT = 50;

  if (rewards?.length === 0) {
    return <div>{t('noRewards')}</div>;
  }

  return (
    <>
      <div className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2">
        <h2 className="text-lg font-semibold mb-2">{t('table.title')}</h2>
      </div>
      {FIRST_ERRORS_COUNT < rewards.length ? 
        (<div className="text-m">{t('table.uploadedMessageFirst', { count: rewards.length, firstCount: FIRST_ERRORS_COUNT })}</div>)
        : (<div className="text-m">{t('table.uploadedMessageFull', { count: rewards.length })}</div>)
      }
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('table.userAddress')}</TableHead>
            <TableHead>{t('table.tokenAddress')}</TableHead>
            <TableHead>{t('table.amount')}</TableHead>
            <TableHead>{t('table.actionType')}</TableHead>
            <TableHead>{t('table.rewardId')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rewards.filter((v, i) => i < Math.min(FIRST_ERRORS_COUNT, rewards.length)).map((reward, idx) => (
            <TableRow key={`reward-${idx}`}>
              <TableCell>{desanitizeString(reward.userAddress)}</TableCell>
              <TableCell>{desanitizeString(reward.tokenAddress)}</TableCell>
              <TableCell>{desanitizeString(reward.amount?.toString())}</TableCell>
              <TableCell>{desanitizeString(reward.actionType)}</TableCell>
              <TableCell>{desanitizeString(reward.rewardId)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
