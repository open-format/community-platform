"use client";

import { fundAccount } from "@/lib/openformat";
import { useLogin, usePrivy, useModalStatus } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from 'next-intl';
import { Mail, Disc, Github, Send } from "lucide-react";

export default function Auth() {
  const { ready, authenticated } = usePrivy();
  const { login: openLoginModal } = useLogin();
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
    if (ready && authenticated) {
      router.push("/communities");
    }
  }, [disableLogin, isOpen, ready, authenticated, router]);

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

  const handleEmailLogin = () => openLoginModal({ loginMethods: ['email'] });
  const handleDiscordLogin = () => openLoginModal({ loginMethods: ['discord'] });
  const handleGithubLogin = () => openLoginModal({ loginMethods: ['github'] });
  const handleTelegramLogin = () => openLoginModal({ loginMethods: ['telegram'] });
  const handleWalletLogin = () => openLoginModal({ loginMethods: ['wallet'] });

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black text-white">
      {/* Left: Onboarding journey and value props */}
      <div className="flex flex-col justify-center items-start w-full md:w-1/2 px-10 py-16 bg-zinc-900 border-r border-zinc-800 min-h-screen">
        <h2 className="text-3xl font-bold mb-2">Create an account</h2>
        <p className="text-gray-400 mb-8">Get started with Open Format</p>
        <div className="mb-8 w-full">
          <h3 className="text-lg font-semibold mb-4">Your onboarding journey</h3>
          <ol className="space-y-2 text-gray-300">
            <li><span className="font-bold text-white mr-2">1</span> Create an account</li>
            <li><span className="font-bold text-white mr-2">2</span> Connect to your community</li>
            <li><span className="font-bold text-white mr-2">3</span> Deploy the agent to your server</li>
            <li><span className="font-bold text-white mr-2">4</span> Access your community dashboard</li>
          </ol>
        </div>
        <div className="mb-8 w-full">
          <h3 className="text-lg font-semibold mb-4">Why Open Format?</h3>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start gap-2"><span className="text-green-400">✓</span> Track and reward valuable contributions across your community</li>
            <li className="flex items-start gap-2"><span className="text-green-400">✓</span> AI-powered agent analyzes engagement and identifies top contributors</li>
            <li className="flex items-start gap-2"><span className="text-green-400">✓</span> Gain actionable insights to help grow your community</li>
            <li className="flex items-start gap-2"><span className="text-green-400">✓</span> Seamlessly integrate with Discord, GitHub, Telegram and more</li>
          </ul>
        </div>
        <button className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm mt-2">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7"/></svg>
          Watch how it works
        </button>
      </div>
      {/* Right: login card */}
      <div className="flex flex-1 items-center justify-center bg-black px-4 py-16 min-h-screen">
        <div className="w-full max-w-md bg-zinc-900 rounded-xl shadow-lg p-8 flex flex-col items-center">
          <h2 className="text-xl font-bold mb-6">Log in or sign up</h2>
          <div className="w-full flex flex-col gap-3">
            {/* Email login */}
            <button
              className="flex items-center gap-2 bg-zinc-800 rounded-lg px-4 py-2 hover:bg-zinc-700 transition"
              onClick={handleEmailLogin}
            >
              <Mail className="h-5 w-5 text-gray-400" /> Email
            </button>
            {/* Discord login */}
            <button
              className="flex items-center gap-2 bg-zinc-800 rounded-lg px-4 py-2 hover:bg-zinc-700 transition"
              onClick={handleDiscordLogin}
            >
              <Disc className="h-5 w-5 text-indigo-400" /> Discord
            </button>
            {/* GitHub login */}
            <button
              className="flex items-center gap-2 bg-zinc-800 rounded-lg px-4 py-2 hover:bg-zinc-700 transition"
              onClick={handleGithubLogin}
            >
              <Github className="h-5 w-5 text-gray-300" /> GitHub
            </button>
            {/* Telegram login */}
            <button
              className="flex items-center gap-2 bg-zinc-800 rounded-lg px-4 py-2 hover:bg-zinc-700 transition"
              onClick={handleTelegramLogin}
            >
              <Send className="h-5 w-5 text-blue-400" /> Telegram
            </button>
            {/* Wallet login */}
            <button
              className="flex items-center gap-2 bg-zinc-800 rounded-lg px-4 py-2 hover:bg-zinc-700 transition"
              onClick={handleWalletLogin}
            >
              <span className="h-5 w-5 inline-block bg-gradient-to-tr from-indigo-400 to-purple-400 rounded-full" /> Continue with a wallet
            </button>
          </div>
          <div className="mt-8 text-xs text-gray-500 flex items-center gap-1">Protected by <span className="font-bold">● privy</span></div>
        </div>
      </div>
    </div>
  );
}
