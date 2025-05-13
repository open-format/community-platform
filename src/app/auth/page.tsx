"use client";

import { fundAccount } from "@/lib/openformat";
import { useLogin, usePrivy, useModalStatus } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslations } from 'next-intl';

export default function Auth() {
  const { login, ready, authenticated } = usePrivy();
  const { isOpen } = useModalStatus();
  const t = useTranslations('auth');
  const router = useRouter();

  const disableLogin = !ready || (ready && authenticated);

  useLogin({
    onComplete: async ({ user, isNewUser }) => {
      if (isNewUser && user.wallet?.address) {
        await fundAccount();
      }
      router.push("/communities");
    },
  });

  useEffect(() => {
    if (!disableLogin && !isOpen) {
      login();
    }
    if (ready && authenticated) {
      router.push("/communities");
    }
  }, [disableLogin, isOpen, ready, authenticated, login, router]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <div>{t('loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black text-white">
      {/* Left: Placeholder content */}
      <div className="flex flex-col justify-center items-center md:items-start w-full md:w-1/2 px-8 py-16">
        <h1 className="text-4xl font-bold mb-4">Welcome to OpenFormat</h1>
        <p className="text-lg text-gray-300 max-w-md">Connect your wallet or social account to get started. This is placeholder content. (Sarah & Dan will provide real copy.)</p>
      </div>
      {/* Right: Privy modal always showing */}
      <div className="flex flex-1 items-center justify-center bg-zinc-900 px-4 py-16">
        {/* The Privy modal is always triggered by useEffect; nothing else needed here */}
      </div>
    </div>
  );
}
