"use client";

import BatchRewardList from "@/components/batch-reward-list";
import { Confetti } from "@/components/confetti";
import ResultList from "@/components/result-list";
import { RewardsProgressDialog } from "@/components/rewards-progress-dialog";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { EXAMPLE_CSV_DATA } from "@/constants/examples";
import { getViemErrorMessage } from "@/helpers/errors";
import { executeRewardFromParams, rewardMulticall } from "@/lib/chain";
import { revalidate } from "@/lib/openformat";
import { findAllUsersByHandle } from "@/lib/privy";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePrivy } from "@privy-io/react-auth";
import { Loader2, SettingsIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ParseResult, parse } from "papaparse";
import { useState, useTransition } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { BaseError, isAddress } from "viem";
import { useConfig, useSwitchChain } from "wagmi";
import * as z from "zod";
import { BatchRewardsSettingsForm } from "./batch-rewards-settings-form";

export enum BatchRewardState {
  INITIAL = "initial",
  PARSING = "parsing",
  PREVIEW = "preview",
  REWARDING = "rewarding",
}

const defaultSettings: BatchRewardSettings = {
  header: true,
  delimiter: "",
  multicall: true,
};

const defaultProgressInfo: BatchRewardProgressInfo = {
  failed: 0,
  success: 0,
  total: 0,
};

type CsvEntry = {
  user: string;
  token: string;
  amount: string;
  actionType: string;
  rewardId: string;
};

const CsvColumns = ["user", "token", "amount", "actionType", "rewardId"];

// TODO: Move this to config var?
const MULTICALL_BATCH_SIZE = 100;

export default function BatchRewardsForm({ community }: { community: Community }) {
  const t = useTranslations("batchRewards");
  const [showConfetti, setShowConfetti] = useState(false);
  const [rewardProgressDialog, setRewardProgressDialog] = useState(false);
  const [rewardSettingsDialog, setRewardSettingsDialog] = useState(false);
  const [rewardList, setRewardList] = useState<BatchRewardEntry[]>([]);
  const [errorList, setErrorList] = useState<string[]>([]);
  const [resultList, setResultList] = useState<BatchRewardEntryResult[]>([]);
  const [rewardState, setRewardState] = useState<BatchRewardState>(BatchRewardState.INITIAL);
  const [batchSettings, setBatchSettings] = useState(defaultSettings);
  const [progressInfo, setProgressInfo] = useState(defaultProgressInfo);
  const config = useConfig();
  const { user } = usePrivy();
  const [isPending, startTransition] = useTransition();
  const { switchChain } = useSwitchChain();

  const rewardSchema = z.object({
    user: z.string().min(1, t("form.validation.user")).max(256, t("form.validation.userMax")),
    token: z.string().min(1, t("form.validation.tokenRequired")),
    amount: z.preprocess(
      (val) => (val === "" ? Number.NaN : Number(val)),
      z
        .number({
          invalid_type_error: t("form.validation.amountRequired"),
        })
        .min(10 ** -18, t("form.validation.amountMin")),
    ),
    actionType: z
      .string()
      .refine(
        (t) =>
          t.toLowerCase() === "mint-token" ||
          t.toLowerCase() === "transfer-token" ||
          t.toLowerCase() === "mint-badge",
        t("form.validation.actionType"),
      ),
    rewardId: z
      .string()
      .min(3, t("form.validation.rewardIdMin"))
      .max(32, t("form.validation.rewardIdMax")),
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
    const toastId = toast.loading(t("form.toast.processing"));
    try {
      if (csvFile) {
        parseCSV(csvFile, sucessParseCSV(toastId), errorParseCSV(toastId));
      } else {
        toast.dismiss(toastId);
      }
    } catch (error) {
      toast.error(t("form.toast.error.failed"), { id: toastId });
    }
  }

  function parseCSV(csvFile: File, successFn: () => void, errorFn: (e: string[]) => void) {
    setRewardState(BatchRewardState.PARSING);
    setRewardProgressDialog(false);
    setRewardSettingsDialog(false);
    setErrorList([]);
    setRewardList([]);
    setResultList([]);
    setProgressInfo({ total: 0, failed: 0, success: 0 });

    parse(csvFile, {
      header: batchSettings.header,
      delimiter: batchSettings.delimiter,
      skipEmptyLines: true,

      complete: (results: ParseResult<string[] | BatchRewardEntry>, file: File) => {
        if (results.errors && results.errors.length > 0) {
          const strErrors = results.errors.map((e) =>
            e.row ? t("form.validation.parseError", { row: e.row, message: e.message }) : e.message,
          );
          errorFn(strErrors);
          return;
        }
        const errors: string[] = [];
        const rewards: BatchRewardEntry[] = [];

        // Check parsed columns
        if (batchSettings.header) {
          // Meta object has parsed columns
          // Check number of columns
          if (results.meta.fields?.length !== CsvColumns.length) {
            errors.push(
              t("form.validation.wrongColumns", {
                columnsExpected: `[${CsvColumns.toString()}]`,
                columnsFound: `[${results.meta.fields?.toString()}]`,
              }),
            );
          } else {
            // Check column names
            CsvColumns.forEach((c) => {
              if (results.meta.fields?.indexOf(c) == -1) {
                errors.push(
                  t("form.validation.columnNotFound", {
                    columnName: c,
                    columnsFound: `[${results.meta.fields?.toString()}]`,
                  }),
                );
              }
            });
          }
        } else {
          // We do not have headers so there are no column names
          // Check numbers of columns and assume they are in correct order
          if (
            results.data.length > 0 &&
            (results.data.at(0) as string[]).length !== CsvColumns.length
          ) {
            errorFn([
              t("form.validation.wrongColumns", {
                columnsExpected: CsvColumns.length.toString(),
                columnsFound: (results.data.at(0) as string[]).length,
              }),
            ]);
            return;
          }
        }

        // CSV with wrong column structure, no need to continue
        if (errors.length > 0) {
          errorFn(errors);
          return;
        }

        results.data.forEach((entry, i) => {
          const entryObj = batchSettings.header
            ? (entry as unknown as CsvEntry)
            : {
                user: (entry as string[])[0],
                token: (entry as string[])[1],
                amount: (entry as string[])[2],
                actionType: (entry as string[])[3],
                rewardId: (entry as string[])[4],
              };
          // Validate CSV entry.
          const parseResult = rewardSchema.safeParse(entryObj);

          if (!parseResult.success) {
            const err = Object.entries(parseResult.error.flatten().fieldErrors)
              .flatMap(([field, messages]) => messages)
              .join(". ");
            errors.push(t("form.validation.rewardError", { row: i + 1, message: err }));
          } else if (
            entryObj.actionType.toLowerCase() === "mint-badge" &&
            !z.number().int().safeParse(Number(entryObj.amount)).success
          ) {
            errors.push(
              t("form.validation.rewardError", {
                row: i + 1,
                message: t("form.validation.amountBadgeInt"),
              }),
            );
          } else {
            // Good entry add to rewards
            rewards.push(parseResult.data);
          }
        });

        // Validation errors, abort processing
        if (errors.length > 0) {
          errorFn(errors);
          return;
        }

        // usernames to search
        const userNames: string[] = [];

        // Validate tokens and set the tokenAddress, userAddress
        rewards.forEach((reward) => {
          if (isAddress(reward.user, { strict: true })) {
            reward.userAddress = reward.user;
          } else {
            // user is a username to search
            userNames.push(reward.user);
          }

          if (isAddress(reward.token, { strict: true })) {
            reward.tokenAddress = reward.token;
          } else {
            // Search token in community badges and tokens
            const token =
              reward.actionType === "mint-badge"
                ? community.onchainData?.badges?.find((b) => b.name === reward.token)
                : community.onchainData?.tokens?.find((t) => t.token?.name === reward.token);
            if (token) {
              reward.tokenAddress =
                reward.actionType === "mint-badge"
                  ? (token as Badge).id
                  : (token as Token).token.id;
            } else {
              errors.push(
                t("form.validation.tokenNotFound", {
                  tokenName: reward.token,
                  communityName: community.name,
                }),
              );
            }
          }
        });

        // Username search is expensive, abort before doing it if there are errors
        if (errors.length > 0) {
          errorFn(errors);
          return;
        }

        // If no usernames to search then finish and change state
        if (userNames.length === 0) {
          setRewardState(BatchRewardState.PREVIEW);
          setRewardList(rewards);
          successFn();
          return;
        }

        validateUsernames(userNames)
          .then(({ walletsMap, errors }) => {
            if (errors.length > 0) {
              errorFn(errors);
              return;
            }
            rewards
              .filter((r) => !r.userAddress)
              .forEach((reward) => {
                const wallet = walletsMap.get(reward.user);
                if (!wallet) {
                  // User has no wallet
                  errors.push(t("noWallets", { handle: reward.user }));
                  return;
                }
                reward.userAddress = wallet;
              });
            // No wallet errors
            if (errors.length > 0) {
              errorFn(errors);
              return;
            }

            // Success, update state and rewardList
            setRewardState(BatchRewardState.PREVIEW);
            setRewardList(rewards);
            successFn();
          })
          .catch((error) => {
            console.log("Error while searching for usernames", error);
            errorFn([t("usernameSearchFailed")]);
          });
      },
    });
  }

  async function validateUsernames(userNames: string[]) {
    let userWallets = [];
    const errors: string[] = [];
    const walletsMap = new Map<string, string | null>();
    try {
      userWallets = await findAllUsersByHandle(userNames);
    } catch (error) {
      console.log("Error searching for users", error);
      errors.push(t("usernameSearchFailed"));
      return { walletsMap, errors };
    }

    userWallets.forEach((wallets) => {
      if (!wallets.discordWalletAddress && !wallets.githubWalletAddress) {
        errors.push(t("noWallets", { handle: wallets.handle }));
        return;
      }
      if (
        wallets.discordWalletAddress &&
        wallets.githubWalletAddress &&
        wallets.discordWalletAddress.toLowerCase() !== wallets.githubWalletAddress.toLowerCase()
      ) {
        const walletError = {
          handle: wallets.handle,
          wallets: `Discord: ${wallets.discordWalletAddress}, Github: ${wallets.githubWalletAddress}`,
        };
        errors.push(t("differentWalletsError", walletError));
        return;
      }

      walletsMap.set(wallets.handle, wallets.discordWalletAddress ?? wallets.githubWalletAddress);
    });
    return { walletsMap, errors };
  }

  function sucessParseCSV(toastId: string | number) {
    return () => {
      toast.success(t("form.toast.uploadSuccess"), { id: toastId });
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
    switchChain({ chainId: community.communityContractChainId });

    setRewardProgressDialog(true);
    setProgressInfo({ total: rewardList.length, success: 0, failed: 0 });
    setRewardState(BatchRewardState.REWARDING);

    startTransition(async () => {
      let errors = 0;
      let success = 0;
      const results: BatchRewardEntryResult[] = [];
      let multicallChunkParams: {
        reward: BatchRewardEntry;
        rewardParams: RewardBadgeParams | RewardTokenMintParams | RewardTokenTransferParams;
      }[] = [];

      for (let i = 0; i < rewardList.length; i++) {
        const reward = rewardList[i];
        let errorMessage: string | null = null;
        let receipt: any = null;
        let rewardParams: RewardBadgeParams | RewardTokenMintParams | RewardTokenTransferParams;
        const actionType = reward.actionType.toLowerCase();
        switch (actionType) {
          case "mint-badge":
            rewardParams = {
              actionType: "mint-badge",
              communityAddress: community.communityContractAddress,
              badgeAddress: reward.tokenAddress!,
              receiverAddress: reward.userAddress!,
              rewardId: reward.rewardId,
              amount: reward.amount,
              activityType: "MISSION",
              metadata: "",
            };
            break;
          case "mint-token":
            rewardParams = {
              actionType: "mint-token",
              communityAddress: community.communityContractAddress,
              tokenAddress: reward.tokenAddress!,
              receiverAddress: reward.userAddress!,
              rewardId: reward.rewardId,
              amount: reward.amount,
              activityType: "MISSION",
              metadata: "",
            };
            break;
          case "transfer-token":
            rewardParams = {
              actionType: "transfer-token",
              communityAddress: community.communityContractAddress,
              tokenAddress: reward.tokenAddress!,
              ownerAddress: user?.wallet?.address ?? "",
              receiverAddress: reward.userAddress!,
              rewardId: reward.rewardId,
              amount: reward.amount,
              activityType: "MISSION",
              metadata: "",
            };
            break;
          default:
            throw new Error(`Unknown action type: ${actionType}`);
        }

        // Execute proper transaction: multicall or regular
        if (batchSettings.multicall) {
          multicallChunkParams.push({ reward, rewardParams });

          // If we have completed a multicall batch or this is the last element
          const shouldExecuteMulticall =
            multicallChunkParams.length >= MULTICALL_BATCH_SIZE || i === rewardList.length - 1;
          if (!shouldExecuteMulticall) {
            continue;
          }

          // Execute Multicall reward.
          try {
            receipt = await rewardMulticall(
              config,
              community.communityContractAddress,
              multicallChunkParams.map((c) => c.rewardParams),
            );
          } catch (error: any) {
            errorMessage =
              error instanceof BaseError
                ? getViemErrorMessage(error)
                : (error.message ?? "Unknown error");
          }

          // Set results for all rewards in batch
          multicallChunkParams.forEach((call) => {
            results.push({
              entry: call.reward,
              success: !errorMessage,
              errorMessage: errorMessage,
              transactionHash: !errorMessage && receipt ? receipt.transactionHash : null,
            });
          });
          // Update progress infor for all rewards
          errors += errorMessage ? multicallChunkParams.length : 0;
          success += !errorMessage ? multicallChunkParams.length : 0;
          multicallChunkParams = [];

          setProgressInfo({ total: rewardList.length, success: success, failed: errors });
        } else {
          // Regular transaction
          try {
            receipt = await executeRewardFromParams(config, rewardParams);
          } catch (error: any) {
            errorMessage =
              error instanceof BaseError
                ? getViemErrorMessage(error)
                : (error.message ?? "Unknown error");
          }
          // Set result
          results.push({
            entry: reward,
            success: !errorMessage,
            errorMessage: errorMessage,
            transactionHash: !errorMessage && receipt ? receipt.transactionHash : null,
          });
          // Update progress info
          errors += errorMessage ? 1 : 0;
          success += !errorMessage ? 1 : 0;

          setProgressInfo({ total: rewardList.length, success: success, failed: errors });
        }
      }

      setResultList(results);
      setRewardProgressDialog(false);
      if (errors > 0) {
        toast.success(t("form.toast.error.failed"));
      } else {
        setShowConfetti(true);
        toast.success(t("form.toast.rewardsSuccess"));
      }
      setRewardState(BatchRewardState.INITIAL);
      form.reset();
    });
  }

  const downloadCSV = () => {
    const csvContent = EXAMPLE_CSV_DATA.map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "rewards.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
                          disabled={
                            rewardState === BatchRewardState.PARSING ||
                            rewardState === BatchRewardState.REWARDING
                          }
                        />
                      </div>
                      {rewardState === BatchRewardState.PARSING ||
                      rewardState === BatchRewardState.REWARDING ? (
                        <Button disabled>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {rewardState === BatchRewardState.PARSING
                            ? t("form.buttons.uploading")
                            : t("form.buttons.rewarding")}
                        </Button>
                      ) : (
                        <Button
                          disabled={
                            rewardState !== BatchRewardState.PREVIEW || !(rewardList?.length > 0)
                          }
                          onClick={(e) => {
                            processRewards();
                            e.preventDefault();
                          }}
                        >
                          {t("form.buttons.reward")}
                        </Button>
                      )}
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          setRewardSettingsDialog(true);
                        }}
                      >
                        <SettingsIcon></SettingsIcon>
                      </Button>

                      <BatchRewardsSettingsForm
                        settings={batchSettings}
                        open={rewardSettingsDialog}
                        close={() => {
                          setRewardSettingsDialog(false);
                        }}
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
        {rewardState === BatchRewardState.INITIAL && resultList.length == 0 && (
          <>
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
            <div className=" text-gray-500 bg-muted">
              <Button variant={"link"} onClick={downloadCSV}>
                Download Sample File
              </Button>
            </div>
          </>
        )}
        {errorList.length > 0 && <ResultList errors={errorList} />}
        {resultList.length > 0 && <ResultList rewardsResults={resultList} />}
        {rewardState !== BatchRewardState.INITIAL &&
          rewardState !== BatchRewardState.PARSING &&
          errorList.length == 0 && <BatchRewardList rewards={rewardList} />}
        {rewardState === BatchRewardState.PARSING && <Loader2 className="h-6 w-6 animate-spin" />}
      </CardContent>
    </>
  );
}
