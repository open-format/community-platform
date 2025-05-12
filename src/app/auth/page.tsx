"use client";

import { fundAccount } from "@/lib/openformat";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, MessageCircle, Mail, Github } from "lucide-react";

export default function Auth() {
  const { login, ready, authenticated } = usePrivy();
  const t = useTranslations('auth');
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
    if (ready && authenticated) {
      router.push("/communities");
    }
  }, [ready, authenticated, router]);

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
      {/* Right: Auth Card */}
      <div className="flex flex-1 items-center justify-center bg-zinc-900 px-4 py-16">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t('connectTitle') || "Sign in to your account"}</CardTitle>
            <CardDescription className="text-white/80">
              {t('connectDescription') || "Choose a login method below."}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button
              variant="outline"
              className="w-full flex items-center justify-start"
              onClick={() => login({ loginMethods: ["wallet"] })}
            >
              <Wallet className="mr-2 h-5 w-5" />
              {t('connectWallet') || "Connect Wallet"}
            </Button>
            <Button
              variant="outline"
              className="w-full flex items-center justify-start"
              onClick={() => login({ loginMethods: ["discord"] })}
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              {t('connectDiscord') || "Login with Discord"}
            </Button>
            <Button
              variant="outline"
              className="w-full flex items-center justify-start"
              onClick={() => login({ loginMethods: ["github"] })}
            >
              <Github className="mr-2 h-5 w-5" />
              {t('connectGithub') || "Login with GitHub"}
            </Button>
            <Button
              variant="outline"
              className="w-full flex items-center justify-start"
              onClick={() => login({ loginMethods: ["email"] })}
            >
              <Mail className="mr-2 h-5 w-5" />
              {t('connectEmail') || "Login with Email"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
