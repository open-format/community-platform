import { generateChallenge, verifyChallenge } from "@/lib/openformat";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { signMessage as signMessageWallet } from "@wagmi/core";
import { usePrivy } from "@privy-io/react-auth";
import { useConfig } from "wagmi";
import { getAddress } from "@/lib/utils";

export function useApiKey() {
  const t = useTranslations("profile");
  const { signMessage, user } = usePrivy();
  const config = useConfig();
  const address = getAddress(user);

  // state
  const [apiKey, setApiKey] = useState<string>("");
  const [isError, setError] = useState<boolean>(false);
  const [creatingNewApiKey, setCreatingNewApiKey] = useState<boolean>(false);

  const resetState = useCallback(() => {
    setApiKey("");
    setError(false);
    setCreatingNewApiKey(false);
  }, []);

  const copyApiKeyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(apiKey || "");
    toast.success(t("apiKey.apiKeyCopied"));
    resetState();
  }, [apiKey, t, resetState]);

  async function generateNewApiKey() {
    setApiKey("");
    setError(false);
    setCreatingNewApiKey(true);

    try {
      const challenge = await generateChallenge(address);
      let signed: { signature: string };

      if (user?.wallet?.walletClientType === "privy") {
        signed = await signMessage({
          message: challenge.challenge,
        });
      } else {
        signed = {
          signature: await signMessageWallet(config, {
            message: challenge.challenge,
          }),
        };
      }

      if (challenge.status === "success") {
        const data = await verifyChallenge(address, signed.signature);

        if ("api_key" in data) {
          setApiKey(data.api_key);
        } else {
          setError(true);
          setCreatingNewApiKey(false);
        }
      } else {
        setError(true);
        setCreatingNewApiKey(false);
      }
    } catch (e) {
      setError(true);
      setCreatingNewApiKey(false);
    }
  }

  return {
    copyApiKeyToClipboard,
    apiKey,
    generateNewApiKey,
    resetState,
    processing: creatingNewApiKey,
    error: isError,
  };
}
