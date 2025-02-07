"use client";

import { fundAccount } from "@/lib/openformat";
import { useLogin, useModalStatus, usePrivy } from "@privy-io/react-auth";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslations } from 'next-intl';

export default function Auth() {
  const { login, ready, authenticated } = usePrivy();
  const t = useTranslations('auth');
  const disableLogin = !ready || (ready && authenticated);
  const { isOpen } = useModalStatus();
  const router = useRouter();

  useLogin({
    onComplete: async ({ user, isNewUser }) => {
      if (isNewUser && user.wallet?.address) {
        await fundAccount();
      }
      router.push("/communities");
    },
  });

  useEffect(() => {
    if (!disableLogin) {
      login();
    }
  }, [disableLogin, isOpen]);

  return (
    <div>
      <div className="text-center text-sm text-gray-500 bg-foreground/10 p-4 font-semibold">
        {t('notice')}
      </div>
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="mr-2 h-12 w-12 animate-spin" />
      </div>
    </div>
  );
}
