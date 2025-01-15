import { toast } from "sonner";
import {
  type BaseError,
  ChainDisconnectedError,
  EstimateGasExecutionError,
  HttpRequestError,
  InternalRpcError,
  InvalidInputRpcError,
  InvalidParamsRpcError,
  InvalidRequestRpcError,
  JsonRpcVersionUnsupportedError,
  MethodNotFoundRpcError,
  ParseRpcError,
  ProviderDisconnectedError,
  ResourceNotFoundRpcError,
  ResourceUnavailableRpcError,
  RpcError,
  TransactionRejectedRpcError,
  UserRejectedRequestError,
} from "viem";

export function handleViemError(error: BaseError) {
  let message = "An unexpected error occurred.";

  const errorMappings = [
    { type: EstimateGasExecutionError, message: "You have insufficient funds to cover gas for this transaction." },
    { type: UserRejectedRequestError, message: "User rejected the request." },
    { type: ChainDisconnectedError, message: "The blockchain network is disconnected." },
    { type: HttpRequestError, message: "Network request failed. Please check your internet connection." },
    { type: InternalRpcError, message: "Internal RPC error occurred." },
    { type: InvalidInputRpcError, message: "Invalid input provided." },
    { type: InvalidParamsRpcError, message: "Invalid parameters provided." },
    { type: InvalidRequestRpcError, message: "Invalid request." },
    { type: JsonRpcVersionUnsupportedError, message: "Unsupported JSON-RPC version." },
    { type: MethodNotFoundRpcError, message: "Requested method not found." },
    { type: ParseRpcError, message: "Error parsing response." },
    { type: ProviderDisconnectedError, message: "Provider disconnected." },
    { type: ResourceNotFoundRpcError, message: "Requested resource not found." },
    { type: ResourceUnavailableRpcError, message: "Requested resource is unavailable." },
    { type: RpcError, message: "RPC error occurred." },
    { type: TransactionRejectedRpcError, message: "Transaction was rejected." },
  ];

  error.walk((err) => {
    // @TODO: Remove this after beta
    console.log({ err });
    for (const { type, message: msg } of errorMappings) {
      if (err instanceof type) {
        message = msg;
        return true; // Stop walking once a match is found
      }
    }
    return false; // Continue walking if no match is found
  });

  // Display the error message using the Toaster
  toast.error(message);
}
