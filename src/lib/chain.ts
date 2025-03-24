import { erc20BaseAbi } from "@/abis/ERC20Base";
import { rewardFacetAbi } from "@/abis/RewardFacet";
import { turboChain } from "@/constants/chains";
import { type Config, readContract, waitForTransactionReceipt, writeContract } from "@wagmi/core";
import {
  type Address,
  encodeFunctionData,
  erc20Abi,
  maxUint256,
  parseEther,
  parseGwei,
  stringToHex,
} from "viem";
import { aurora } from "viem/chains";

export async function executeRewardFromParams(
  config: Config,
  rewardParams: RewardBadgeParams | RewardTokenMintParams | RewardTokenTransferParams,
) {
  switch (rewardParams.actionType) {
    case "mint-badge":
      return rewardBadge(config, rewardParams);
    case "mint-token":
      return rewardTokenMint(config, rewardParams);
    case "transfer-token":
      return rewardTokenTransfer(config, rewardParams);
    default:
      throw new Error("Unknown action type");
  }
}

export async function rewardBadge(config: Config, rewardBadgeParams: RewardBadgeParams) {
  if (rewardBadgeParams.amount === 1) {
    return await executeTransaction(config, {
      address: rewardBadgeParams.communityAddress as Address,
      abi: rewardFacetAbi,
      functionName: "mintBadge",
      args: [
        rewardBadgeParams.badgeAddress as Address,
        rewardBadgeParams.receiverAddress as Address,
        stringToHex(rewardBadgeParams.rewardId, { size: 32 }),
        stringToHex(rewardBadgeParams.activityType, { size: 32 }),
        rewardBadgeParams.metadata?.length > 0 ? stringToHex(rewardBadgeParams.metadata) : "",
      ],
    });
  }

  return await executeTransaction(config, {
    address: rewardBadgeParams.communityAddress as Address,
    abi: rewardFacetAbi,
    functionName: "batchMintBadge",
    args: [
      rewardBadgeParams.badgeAddress as Address,
      rewardBadgeParams.receiverAddress as Address,
      BigInt(rewardBadgeParams.amount),
      stringToHex(rewardBadgeParams.rewardId, { size: 32 }),
      stringToHex(rewardBadgeParams.activityType, { size: 32 }),
      rewardBadgeParams.metadata?.length > 0 ? stringToHex(rewardBadgeParams.metadata) : "",
    ],
  });
}

export async function rewardTokenMint(
  config: Config,
  rewardTokenMintParams: RewardTokenMintParams,
) {
  return await executeTransaction(config, {
    address: rewardTokenMintParams.communityAddress as Address,
    abi: rewardFacetAbi,
    functionName: "mintERC20",
    args: [
      rewardTokenMintParams.tokenAddress as Address,
      rewardTokenMintParams.receiverAddress as Address,
      parseEther(rewardTokenMintParams.amount.toString()),
      stringToHex(rewardTokenMintParams.rewardId, { size: 32 }),
      stringToHex(rewardTokenMintParams.activityType, { size: 32 }),
      rewardTokenMintParams.metadata?.length > 0 ? stringToHex(rewardTokenMintParams.metadata) : "",
    ],
  });
}

export async function rewardTokenTransfer(
  config: Config,
  rewardTokenTransferParams: RewardTokenTransferParams,
) {
  await createAllowance(config, rewardTokenTransferParams);
  return await executeTransaction(config, {
    address: rewardTokenTransferParams.communityAddress as Address,
    abi: rewardFacetAbi,
    functionName: "transferERC20",
    args: [
      rewardTokenTransferParams.tokenAddress as Address,
      rewardTokenTransferParams.receiverAddress as Address,
      parseEther(rewardTokenTransferParams.amount.toString()),
      stringToHex(rewardTokenTransferParams.rewardId, { size: 32 }),
      stringToHex(rewardTokenTransferParams.activityType, { size: 32 }),
      rewardTokenTransferParams.metadata?.length > 0
        ? stringToHex(rewardTokenTransferParams.metadata)
        : "",
    ],
  });
}

async function createAllowance(
  config: Config,
  rewardTokenTransferParams: RewardTokenTransferParams,
) {
  const allowance = await getAllowance(config, rewardTokenTransferParams);

  if (allowance < parseEther(rewardTokenTransferParams.amount.toString())) {
    await writeContract(config, {
      address: rewardTokenTransferParams.tokenAddress as Address,
      abi: erc20Abi,
      functionName: "approve",
      args: [rewardTokenTransferParams.communityAddress as Address, maxUint256],
    });
  }
}

async function getAllowance(config: Config, rewardTokenTransferParams: RewardTokenTransferParams) {
  return await readContract(config, {
    address: rewardTokenTransferParams.tokenAddress as Address,
    abi: erc20Abi,
    functionName: "allowance",
    args: [
      rewardTokenTransferParams.ownerAddress as Address,
      rewardTokenTransferParams.communityAddress as Address,
    ],
  });
}

export async function rewardMulticall(
  config: Config,
  communityAddress: string,
  functionCalls: (RewardBadgeParams | RewardTokenMintParams | RewardTokenTransferParams)[],
) {
  if (!functionCalls || functionCalls.length === 0) {
    return null;
  }
  const encodedAllowanceCalls = new Map<string, `0x${string}`[]>(); // <tokenAddress, allowanceCalls>
  const encodedFunctionCalls: `0x${string}`[] = [];
  for (const call of functionCalls) {
    switch (call.actionType) {
      case "transfer-token":
        const allowanceData = await encodeAllowanceCall(config, call);
        if (allowanceData) {
          const currentCalls = encodedAllowanceCalls.get(call.tokenAddress.toLowerCase()) ?? [];
          currentCalls.push(allowanceData);
          encodedAllowanceCalls.set(call.tokenAddress.toLowerCase(), currentCalls);
        }
        encodedFunctionCalls.push(encodeTransferCall(call));
        break;
      case "mint-badge":
        encodedFunctionCalls.push(encodeBadgeCall(call));
        break;
      case "mint-token":
        encodedFunctionCalls.push(encodeMintCall(call));
        break;
      default:
        throw new Error("Unknown action type");
    }
  }
  // Execute allowance calls before all others.
  for (const [tokenAddress, calls] of encodedAllowanceCalls) {
    await writeContract(config, {
      address: tokenAddress as Address,
      abi: erc20BaseAbi,
      functionName: "multicall",
      args: [calls], // Single arg: Array of encoded functions calls
    });
  }
  // Execute all reward functions in communityAddress
  const transactionHash = await writeContract(config, {
    address: communityAddress as Address,
    abi: erc20BaseAbi,
    functionName: "multicall",
    args: [encodedFunctionCalls], // Single arg: Array of encoded functions calls
  });
  const receipt = await waitForTransactionReceipt(config, { hash: transactionHash });
  return receipt;
}

function encodeBadgeCall(rewardBadgeParams: RewardBadgeParams): `0x${string}` {
  if (rewardBadgeParams.amount === 1) {
    return encodeFunctionData({
      abi: rewardFacetAbi,
      functionName: "mintBadge",
      args: [
        rewardBadgeParams.badgeAddress as Address,
        rewardBadgeParams.receiverAddress as Address,
        stringToHex(rewardBadgeParams.rewardId, { size: 32 }),
        stringToHex(rewardBadgeParams.activityType, { size: 32 }),
        rewardBadgeParams.metadata?.length > 0 ? stringToHex(rewardBadgeParams.metadata) : "",
      ],
    });
  }

  return encodeFunctionData({
    abi: rewardFacetAbi,
    functionName: "batchMintBadge",
    args: [
      rewardBadgeParams.badgeAddress as Address,
      rewardBadgeParams.receiverAddress as Address,
      BigInt(rewardBadgeParams.amount),
      stringToHex(rewardBadgeParams.rewardId, { size: 32 }),
      stringToHex(rewardBadgeParams.activityType, { size: 32 }),
      rewardBadgeParams.metadata?.length > 0 ? stringToHex(rewardBadgeParams.metadata) : "",
    ],
  });
}

function encodeMintCall(rewardTokenMintParams: RewardTokenMintParams): `0x${string}` {
  return encodeFunctionData({
    abi: rewardFacetAbi,
    functionName: "mintERC20",
    args: [
      rewardTokenMintParams.tokenAddress as Address,
      rewardTokenMintParams.receiverAddress as Address,
      parseEther(rewardTokenMintParams.amount.toString()),
      stringToHex(rewardTokenMintParams.rewardId, { size: 32 }),
      stringToHex(rewardTokenMintParams.activityType, { size: 32 }),
      rewardTokenMintParams.metadata?.length > 0 ? stringToHex(rewardTokenMintParams.metadata) : "",
    ],
  });
}

function encodeTransferCall(rewardTokenTransferParams: RewardTokenTransferParams): `0x${string}` {
  return encodeFunctionData({
    abi: rewardFacetAbi,
    functionName: "transferERC20",
    args: [
      rewardTokenTransferParams.tokenAddress as Address,
      rewardTokenTransferParams.receiverAddress as Address,
      parseEther(rewardTokenTransferParams.amount.toString()),
      stringToHex(rewardTokenTransferParams.rewardId, { size: 32 }),
      stringToHex(rewardTokenTransferParams.activityType, { size: 32 }),
      rewardTokenTransferParams.metadata?.length > 0
        ? stringToHex(rewardTokenTransferParams.metadata)
        : "",
    ],
  });
}

async function encodeAllowanceCall(
  config: Config,
  rewardTokenTransferParams: RewardTokenTransferParams,
) {
  const allowance = await getAllowance(config, rewardTokenTransferParams);
  if (allowance < parseEther(rewardTokenTransferParams.amount.toString())) {
    return encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: [rewardTokenTransferParams.communityAddress as Address, maxUint256],
    });
  }
  return null;
}

async function executeTransaction(config: Config, params: any) {
  const transactionHash = await writeContract(config, params);
  const receipt = await waitForTransactionReceipt(config, { hash: transactionHash });
  return receipt;
}

export function txOverrides(chainId: number) {
  console.log("chainId", chainId, aurora.id);
  switch (chainId) {
    case turboChain.id:
    case aurora.id:
      return {
        maxFeePerGas: parseGwei("0.08"),
        maxPriorityFeePerGas: parseGwei("0.08"),
      };

    default:
      return {};
  }
}
