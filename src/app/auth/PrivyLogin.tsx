"use client";

import { useLogin, usePrivy } from "@privy-io/react-auth";
import axios from "axios";
import { Disc, Github, Mail, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { useState } from "react";

export function PrivyLogin() {
  const { ready, logout } = usePrivy();
  const { login: openLoginModal } = useLogin();
  const router = useRouter();
  const [error, setError] = useState("");

  useLogin({
    onComplete: async ({ user, loginMethod }) => {
      if (user.wallet?.address) {
        try {
          const res = await axios.post("/api/users/create", {
            did: user.id,
          });

          if (res.data.new) {
            posthog.capture?.("user_signed_up", {
              loginMethod: loginMethod || null,
              userId: user.id,
            });
            return router.push("/onboarding");
          }
        } catch (error) {
          console.log(error);
          if (axios.isAxiosError(error)) {
            setError("An error occurred while creating your account. Please try again.");
            return logout();
          }
        }
      }
      return router.push("/communities");
    },
  });

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center bg-black px-4 py-16 min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-black px-4 py-16 min-h-screen">
      <div className="w-full max-w-md bg-zinc-900 rounded-xl shadow-lg p-8 flex flex-col items-center">
        <h2 className="text-xl font-bold mb-6">Log in or sign up</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="w-full flex flex-col gap-3">
          <button
            className="flex items-center gap-2 bg-zinc-800 rounded-lg px-4 py-2 hover:bg-zinc-700 transition"
            onClick={() => openLoginModal({ loginMethods: ["email"] })}
          >
            <Mail className="h-5 w-5 text-gray-400" /> Email
          </button>
          <button
            className="flex items-center gap-2 bg-zinc-800 rounded-lg px-4 py-2 hover:bg-zinc-700 transition"
            onClick={() => openLoginModal({ loginMethods: ["discord"] })}
          >
            <Disc className="h-5 w-5 text-indigo-400" /> Discord
          </button>
          <button
            className="flex items-center gap-2 bg-zinc-800 rounded-lg px-4 py-2 hover:bg-zinc-700 transition"
            onClick={() => openLoginModal({ loginMethods: ["github"] })}
          >
            <Github className="h-5 w-5 text-gray-300" /> GitHub
          </button>
          <button
            className="flex items-center gap-2 bg-zinc-800 rounded-lg px-4 py-2 hover:bg-zinc-700 transition"
            onClick={() => openLoginModal({ loginMethods: ["telegram"] })}
          >
            <Send className="h-5 w-5 text-blue-400" /> Telegram
          </button>
          <button
            className="flex items-center gap-2 bg-zinc-800 rounded-lg px-4 py-2 hover:bg-zinc-700 transition"
            onClick={() => openLoginModal({ loginMethods: ["wallet"] })}
          >
            <span className="h-5 w-5 inline-block bg-gradient-to-tr from-indigo-400 to-purple-400 rounded-full" />{" "}
            Continue with a wallet
          </button>
        </div>
        <div className="mt-8 text-xs text-gray-500 flex items-center gap-1">
          Protected by <span className="font-bold">● privy</span>
        </div>
      </div>
    </div>
  );
}
