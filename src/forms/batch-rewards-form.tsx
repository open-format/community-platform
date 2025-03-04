"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Confetti } from "@/components/confetti";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { revalidate } from "@/lib/openformat";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, SettingsIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { useTranslations } from "next-intl";
import { parse, ParseResult } from "papaparse";
import BatchRewardList from "@/components/batch-reward-list";
import { CardContent } from "@/components/ui/card";
import { BatchRewardsSettingsForm } from "./batch-rewards-settings-form";
import { Address, BaseError, erc20Abi, isAddress, maxUint256, parseEther, stringToHex } from "viem";
import { RewardsProgressDialog } from "@/components/rewards-progress-dialog";
import { readContract, waitForTransactionReceipt, writeContract } from "@wagmi/core";
import { rewardFacetAbi } from "@/abis/RewardFacet";
import { useConfig } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { getViemErrorMessage } from "@/helpers/errors";
import ResultList from "@/components/result-list";

export enum BatchRewardState {
  INITIAL = "initial",
  PARSING = "parsing",
  PREVIEW = "preview",
  REWARDING = "rewarding",
}

const defaultSettings: BatchRewardSettings = {
  header: true,
  delimiter: "",
};

const defaultProgressInfo: BatchRewardProgressInfo = {
  failed: 0,
  success: 0,
  total: 0,
};

type CsvEntry = {
  userAddress: string,
  tokenAddress: string,
  amount: string,
  actionType: string,
  rewardId: string,
}

const CsvColumns = [
  'userAddress',
  'tokenAddress',
  'amount',
  'actionType',
  'rewardId',
];

export default function BatchRewardsForm({ community }: { community: Community }) {
  const t = useTranslations('batchRewards');
  const [showConfetti, setShowConfetti]                   = useState(false);
  const [rewardProgressDialog, setRewardProgressDialog]   = useState(false);
  const [rewardSettingsDialog, setRewardSettingsDialog]   = useState(false);
  const [rewardList, setRewardList]                       = useState<BatchRewardEntry[]>([]);
  const [errorList, setErrorList]                         = useState<string[]>([]);
  const [resultList, setResultList]                       = useState<BatchRewardEntryResult[]>([]);
  const [rewardState, setRewardState]                     = useState<BatchRewardState>(BatchRewardState.INITIAL);
  const [batchSettings, setBatchSettings]                 = useState(defaultSettings);
  const [progressInfo, setProgressInfo]                   = useState(defaultProgressInfo);
  const config                                            = useConfig();
  const { user }                                          = usePrivy();
  const [isPending, startTransition]                      = useTransition();

  const rewardSchema = z.object({
    userAddress: z.string().refine(addr => isAddress(addr, { strict: true }), t('form.validation.userAddress')),
    tokenAddress: z.string().refine(addr => isAddress(addr, { strict: true }), t('form.validation.tokenAddress')),
    amount: z.preprocess(
      (val) => (val === "" ? NaN : Number(val)),
      z.number({
        invalid_type_error: t('form.validation.amountRequired')
      })
        .min(10 ** -18, t('form.validation.amountMin'))
    ),
    actionType: z.string().refine(t => t.toLowerCase() === "mint" || t.toLowerCase() === "transfer" || t.toLowerCase() === "badge", t('form.validation.actionType')),
    rewardId: z.string().min(3, t('form.validation.rewardIdMin')),
  });

  const FormSchema = z.object({
    csvFile: z.instanceof(File).refine((file) => file.size <= 100 * 1024 * 1024, {
      message: t("form.validation.fileSizeExceeded"),
    }),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { csvFile: undefined },
  });


  function processCSV(csvFile: File | null) {
    const toastId = toast.loading(t('form.toast.processing'));
    try {
      if (csvFile) {
        parseCSV(csvFile, sucessParseCSV(toastId), errorParseCSV(toastId));
      } else {
        toast.dismiss(toastId);
      }
    } catch (error) {
      toast.error(t('form.toast.error.failed'), { id: toastId });
    }
  }

  function parseCSV(csvFile: File, successFn: () => void, errorFn: (e: string[]) => void) {
    setRewardState(BatchRewardState.PARSING);
    setRewardProgressDialog(false);
    setRewardSettingsDialog(false);
    setErrorList([]);
    setRewardList([]);
    setResultList([]);
    setProgressInfo({total: 0, failed: 0, success: 0});
  
    parse(csvFile, {
      header: batchSettings.header,
      delimiter: batchSettings.delimiter,
      skipEmptyLines: true,
      complete: (results: ParseResult<string[] | BatchRewardEntry>, file: File) => {
        if (results.errors && results.errors.length > 0) {
          const strErrors = results.errors.map(e => e.row ? t('form.validation.parseError', { row: e.row, message: e.message }) : e.message);
          errorFn(strErrors);
        } else {
          if (batchSettings.header) {
            if (results.meta.fields?.length !== CsvColumns.length) {
              errorFn([t('form.validation.wrongColumns', {
                columnsExpected: `[${CsvColumns.toString()}]`,
                columnsFound: `[${results.meta.fields?.toString()}]`,
              })]);
              return;
            }
            const errors: string[] = [];
            CsvColumns.forEach(c => {
              if (results.meta.fields?.indexOf(c) == -1) {
                errors.push(t('form.validation.columnNotFound', { columnName: c, columnsFound: `[${results.meta.fields?.toString()}]` }));
              }
            });

            if (errors.length > 0) {
              errorFn(errors);
              return;
            }
          } else {
            if (results.data.length > 0 && (results.data.at(0) as string[]).length !== CsvColumns.length) {
              errorFn([t('form.validation.wrongColumns', {
                columnsExpected: CsvColumns.length.toString(),
                columnsFound: (results.data.at(0) as string[]).length,
              })]);
              return;
            }
          }

          const errors: string[] = [];
          const rewards: BatchRewardEntry[] = [];
          results.data.map((entry, i) => {
            const entryObj = (batchSettings.header) ? (entry as unknown as CsvEntry) : {
              userAddress:    (entry as string[])[0],
              tokenAddress:   (entry as string[])[1],
              amount:         (entry as string[])[2],
              actionType:     (entry as string[])[3],
              rewardId:       (entry as string[])[4],
            }
            const parseResult = rewardSchema.safeParse(entryObj);
            if (!parseResult.success) {
              const err = Object.entries(parseResult.error.flatten().fieldErrors).flatMap(([field, messages]) => messages).join('. ');
              errors.push(t('form.validation.rewardError', { row: i + 1, message: err }));
            } else if (entryObj.actionType.toLowerCase() === "badge" && !z.number().int().safeParse(Number(entryObj.amount)).success) {
              errors.push(t('form.validation.rewardError', { row: i + 1, message: t('form.validation.amountBadgeInt') }));
            } else {
              rewards.push(parseResult.data);
            }
          });

          if (errors.length > 0) {
            errorFn(errors);
          } else {
            setRewardList(rewards);
            setRewardState(BatchRewardState.PREVIEW);
            successFn();
          }
        }
      }
    });
  }

  function sucessParseCSV(toastId: string | number) {
    return () => {
      toast.success(t('form.toast.uploadSuccess'), { id: toastId });
      form.reset();
      setTimeout(() => toast.dismiss(toastId), 3000);
      revalidate();
    };
  }

  function errorParseCSV(toastId: string | number) {
    return (e: string[]) => {
      toast.dismiss(toastId);
      setRewardState(BatchRewardState.INITIAL);
      setErrorList(e);
    };
  }

  async function processRewards() {
    setRewardProgressDialog(true);
    setProgressInfo({ total: rewardList.length, success: 0, failed: 0 });
    setRewardState(BatchRewardState.REWARDING);

    startTransition(async () => {
      let errors = 0;
      let success = 0;
      const results:BatchRewardEntryResult[] = [];

      for (let i = 0; i < rewardList.length; i++) {
        const reward = rewardList[i];
        let errorMessage = null;
        let receipt = null;
        try {
          if (reward.actionType.toLowerCase() === "badge") {
            let transactionHash: `0x${string}` = "0x0";
            if (reward.amount === 1) {
              transactionHash = await writeContract(config, {
                address: community.id,
                abi: rewardFacetAbi,
                functionName: "mintBadge",
                args: [
                  reward.tokenAddress as Address,
                  reward.userAddress as Address,
                  stringToHex(reward.rewardId, { size: 32 }),
                  stringToHex("MISSION", { size: 32 }),
                  "",
                ],
              });
            } else {
              transactionHash = await writeContract(config, {
                address: community.id,
                abi: rewardFacetAbi,
                functionName: "batchMintBadge",
                args: [
                  reward.tokenAddress as Address,
                  reward.userAddress as Address,
                  BigInt(reward.amount),
                  stringToHex(reward.rewardId, { size: 32 }),
                  stringToHex("MISSION", { size: 32 }),
                  "",
                ],
              });
            }
            receipt = await waitForTransactionReceipt(config, { hash: transactionHash });

          } else if (reward.actionType.toLowerCase() === "mint") {
            // Handle ERC20 token minting
            const hash = await writeContract(config, {
              address: community.id,
              abi: rewardFacetAbi,
              functionName: "mintERC20",
              args: [
                reward.tokenAddress as Address,
                reward.userAddress as Address,
                parseEther(reward.amount.toString()),
                stringToHex(reward.rewardId, { size: 32 }),
                stringToHex("MISSION", { size: 32 }),
                "",
              ],
            });

            receipt = await waitForTransactionReceipt(config, { hash });

          } else {
            const allowance = await readContract(config, {
              address: reward.tokenAddress as Address,
              abi: erc20Abi,
              functionName: "allowance",
              args: [user?.wallet?.address as Address, community.id as Address],
            });

            if (allowance < parseEther(reward.amount.toString())) {
              // Call ERC20 contract to approve the DAPP_ID
              await writeContract(config, {
                address: reward.tokenAddress as Address,
                abi: erc20Abi,
                functionName: "approve",
                args: [community.id as Address, maxUint256],
              });
            }

            const transferHash = await writeContract(config, {
              address: community.id,
              abi: rewardFacetAbi,
              functionName: "transferERC20",
              args: [
                reward.tokenAddress as Address,
                reward.userAddress as Address,
                parseEther(reward.amount.toString()),
                stringToHex(reward.rewardId, { size: 32 }),
                stringToHex("MISSION", { size: 32 }),
                "",
              ],
            });
            receipt = await waitForTransactionReceipt(config, { hash: transferHash });
          }
        } catch (error: any) {
          errorMessage = (error instanceof BaseError) ? getViemErrorMessage(error) : error.message ?? "Unknown error";
        }

        results.push({
          index: i,
          success: !errorMessage,
          errorMessage: errorMessage,
          transactionHash: !errorMessage && receipt ? receipt.transactionHash : null,
          entry: reward,
        });

        errors += errorMessage ? 1 : 0;
        success += !errorMessage ? 1 : 0;

        setProgressInfo({ total: rewardList.length, success: success, failed: errors });
      }

      setResultList(results);
      setRewardProgressDialog(false);
      if ( errors > 0 ) {
        toast.success(t('form.toast.error.failed'));
      } else {
        setShowConfetti(true);
        toast.success(t('form.toast.rewardsSuccess'));
      }
      setRewardState(BatchRewardState.INITIAL);
      form.reset();
    });
  }

  return (
    <>
      <CardContent>
        <FormProvider {...form}>
          <Confetti isVisible={showConfetti} />
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="csvFile"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>{t("form.fields.csvFile.label")}</FormLabel>
                  <FormControl>
                    <div className="flex space-x-2">
                      <div className="relative w-full">
                        <Input
                          {...fieldProps}
                          type="file"
                          accept="*/*"
                          onChange={(e) => processCSV(e.target.files && e.target.files[0])}
                          disabled={rewardState === BatchRewardState.PARSING || rewardState === BatchRewardState.REWARDING}
                        />
                      </div>
                      {rewardState === BatchRewardState.PARSING || rewardState === BatchRewardState.REWARDING ? (
                        <Button disabled>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {rewardState === BatchRewardState.PARSING ? t("form.buttons.uploading") : t("form.buttons.rewarding")}
                        </Button>
                      ) : (
                        <Button
                          disabled={rewardState !== BatchRewardState.PREVIEW || !(rewardList?.length > 0)}
                          onClick={e => { processRewards(); e.preventDefault() }}
                        >{t('form.buttons.reward')}</Button>
                      )}
                      <Button onClick={(e) => {
                        e.preventDefault();
                        setRewardSettingsDialog(true);
                      }}>
                        <SettingsIcon></SettingsIcon>
                      </Button>

                      <BatchRewardsSettingsForm 
                        settings={batchSettings} 
                        open={rewardSettingsDialog}  
                        close={()=>{setRewardSettingsDialog(false)}}
                        setSettings={setBatchSettings}
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
          <RewardsProgressDialog open={rewardProgressDialog} progressInfo={progressInfo} />
        </FormProvider>

      </CardContent>
      <CardContent>
        {errorList.length > 0 && (<ResultList errors={errorList} />)}
        {resultList.length > 0 && (<ResultList rewardsResults={resultList} />)}
        {rewardState === BatchRewardState.INITIAL && errorList.length == 0 && resultList.length == 0 && (
            <div className="text-left text-sm text-gray-500 bg-muted p-4 font-semibold">
              {t.rich("info", { br: () => <br /> })}
              <div className="p-4">
                {t.rich("infoList", {
                  ul: (chunks) => <ul className="list-disc">{chunks}</ul>,
                  li: (chunks) => <li>{chunks}</li>,
                })}
                {/* {t('info')} */}
              </div>
            </div>
          )}
         {rewardState !== BatchRewardState.INITIAL && errorList.length == 0 && <BatchRewardList rewards={rewardList} />}

      </CardContent>
    </>
  );
}
