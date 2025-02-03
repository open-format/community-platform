"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslations } from 'next-intl';

export default function Logout() {
  const router = useRouter();
  const { logout } = usePrivy();
  const t = useTranslations('auth.logout');

  useEffect(() => {
    logout();
    setTimeout(() => {
      router.push("/auth");
    }, 1000);
  }, [logout]);

  return (
    <div className="text-center min-h-[100vh] flex flex-col items-center justify-center p-12 rounded-lg bg-background text-foreground space-y-8">
      <p className="text-4xl md:text-5xl font-bold">{t('title')}</p>
      <p>{t('message')}</p>
    </div>
  );
}
