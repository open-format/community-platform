import { Check, CopyIcon, ExternalLinkIcon, X } from "lucide-react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";
import { desanitizeString } from "@/lib/utils";
import { useCurrentChain } from "@/hooks/useCurrentChain";
import Link from "next/link";
import { Separator } from "./ui/separator";
import { toast } from "sonner";

interface ResultListProps {
  errors?: string[];
  rewardsResults?: BatchRewardEntryResult[];
}

export default function ResultList({ errors, rewardsResults}: ResultListProps) {
    const t       = useTranslations('batchRewards');
    const chain   = useCurrentChain();
    
    const FIRST_ERRORS_COUNT = 20;

    const copyToClipboard = async () => {
        if (!errors || errors.length === 0) return;
        try {
            await navigator.clipboard.writeText(errors!.join("\n"));
            toast.success(t('results.copyErrorSuccess'));
          } catch (error) {
            toast.error(t('results.copyErrorsFailed'));
            console.error("Failed to copy", error);
        }
    };

    const copyResultsToClipboard = async () => {
        if (!rewardsResults || rewardsResults.length === 0) return;
        try {
          const texts:string[] = rewardsResults.map( r => {
            const success     = t('results.successResults', {success: r.success ? t('results.successful') : t('results.failed')});
            const link        = t('results.transactionLink', {link: `${chain!.BLOCK_EXPLORER_URL}/tx/${r.transactionHash}`});
            const rewardId    = t('results.rewardId', {id: r.entry.rewardId});
            const actionType  = t('results.actionType', {type: r.entry.actionType});
            const user        = t('results.userAddress', { address: r.entry.userAddress });
            const error       = r.success ? "" : t('results.failedTransaction', { error: r.errorMessage }) 
            const text        = `${success}, ${actionType}, ${rewardId}, ${user}`;
            return r.success ? `${text}, ${link}` : `${text}, ${error}`;
          });
          await navigator.clipboard.writeText(texts.join("\n"));
          toast.success(t('results.copySuccess'));

        } catch (error) {
          toast.error(t('results.copyFailed'));
          console.error("Failed to copy", error);
        }
    };

  return (
    <>
    {errors && errors?.length > 0 && (<>
      <div className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2">
        <h2 className="text-lg font-semibold mb-2">{t('results.title')}</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="p-0 hover:bg-transparent" variant="ghost" onClick={copyToClipboard}>
                <CopyIcon className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('results.tooltips.copyErrors')}</p>
            </TooltipContent>
          </Tooltip>
          </TooltipProvider>
      </div>
        {FIRST_ERRORS_COUNT < errors.length ? 
            (<div className="text-m">{t('results.importMessageFirst', { count: errors.length, firstCount: FIRST_ERRORS_COUNT })}</div>)
            :(<div className="text-m">{t('results.importMessageFull', { count: errors.length })}</div>)}
        
        <div style={{ padding: "15px 20px" }}>
            {errors.filter((v, i) => i < Math.min(FIRST_ERRORS_COUNT, errors.length)).map((error, index) => (
                <div key={index} className="text-red-500 text-sm">{error}</div>
            ))}
        </div>
      </>)}
      {rewardsResults && rewardsResults.length > 0 && <>
        <div className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2">
        <h2 className="text-lg font-semibold mb-2">{t('results.resultsTitle')}</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="p-0 hover:bg-transparent" variant="ghost" onClick={copyResultsToClipboard}>
                <CopyIcon className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('results.tooltips.copyResults')}</p>
            </TooltipContent>
          </Tooltip>
          </TooltipProvider>
        </div>
          <div className="text-m">{t('results.rewardsMessage', { 
            total: rewardsResults.length, 
            failed: rewardsResults.filter(r => !r.success).length,
            success: rewardsResults.filter(r => r.success).length,
          })}
          </div>
          <div style={{ padding: "15px 20px" }}>
              {rewardsResults.map((result, idx) => (
                  <div key={idx}>
                  <div className="flex items-center space-x-4 py-2">
                    { result.success ? <Check /> : <X /> }
                    <div className="flex-1 space-y-1">
                      <p className="text-sm leading-none">
                          <>
                            <span className="capitalize">{desanitizeString(result.entry.rewardId)}</span>
                            <span> • </span>
                            <span className="capitalize">{result.entry.actionType}</span>
                          </>
                      </p>
                      <p className="text-sm">
                        { t('results.userAddress', { address: result.entry.userAddress }) }
                      </p>
                      { !result.success && <p className="text-sm">
                        { t('results.failedTransaction', { error: result.errorMessage }) }
                      </p> }
                    </div>
                    {chain?.BLOCK_EXPLORER_URL && result.transactionHash && (
                          <Link
                            href={`${chain.BLOCK_EXPLORER_URL}/tx/${result.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={t('results.viewTransactionLabel')}
                          >
                            <ExternalLinkIcon className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                      {idx < rewardsResults.length - 1 && <Separator className="my-2" />}
                    </div>
              ))}
          </div>

      </>}
    </>
  );
}
