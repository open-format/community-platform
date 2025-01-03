import type { appFactoryAbi } from "@/abis/AppFactory";
import type { erc20FactoryAbi } from "@/abis/ERC20FactoryFacet";
import { BaseError, type TransactionReceipt, parseEventLogs } from "viem";

export async function getEventLog(
  receipt: TransactionReceipt,
  abi: typeof appFactoryAbi | typeof erc20FactoryAbi,
  eventName: "Created"
) {
  try {
    const logs = parseEventLogs({
      abi,
      eventName,
      logs: receipt.logs,
    });

    //@TODO This is suitable for now, but may need to be updated in the future.
    return logs[0].args.id;
  } catch (error: any) {
    if (error instanceof BaseError) {
      if (error.details) {
        throw new Error(error.details);
      } else if (error.metaMessages) {
        throw new Error(error.metaMessages[0]);
      }
    } else {
      throw new Error(error.message);
    }
  }
}
