import { Suspense } from "react";
import SetupClient from "./setup-client";

function ProgressBarSkeleton() {
  return (
    <div className="mb-8">
      <div className="flex w-full max-w-3xl mx-auto gap-16 mt-8">
        {/* Step 1: filled */}
        <div className="flex-1 flex flex-col items-start">
          <div className="w-full mb-2 h-1 rounded bg-zinc-800">
            <div className="h-1 rounded bg-yellow-400" style={{ width: "100%" }} />
          </div>
          <span className="font-semibold text-lg text-yellow-400">Connect your community</span>
        </div>
        {/* Step 2: empty */}
        <div className="flex-1 flex flex-col items-start">
          <div className="w-full mb-2 h-1 rounded bg-zinc-800">
            <div className="h-1 rounded" style={{ width: "0%" }} />
          </div>
          <span className="font-semibold text-lg text-gray-400">Setting up your Copilot</span>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="w-full max-w-2xl bg-transparent">
      <ProgressBarSkeleton />
      <div className="bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-800 flex flex-col gap-8 h-full min-h-[600px]">
        {/* Top icon and title area */}
        <div className="flex flex-col items-center mb-4">
          <div className="flex items-center justify-center mb-2">
            <div className="h-12 w-12 rounded-full border-4 border-yellow-400 opacity-60" />
          </div>
          <div className="h-8 w-48 bg-zinc-800 rounded mb-1 animate-pulse" />
          <div className="h-4 w-64 bg-zinc-800 rounded animate-pulse" />
        </div>
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-start gap-4 rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4"
            >
              <div className="h-5 w-5 bg-zinc-800 rounded animate-pulse mt-1" />
              <div className="flex-1">
                <div className="h-5 w-32 bg-zinc-800 rounded animate-pulse mb-2" />
                <div className="h-4 w-48 bg-zinc-800 rounded animate-pulse mb-2" />
                <div className="h-3 w-24 bg-zinc-800 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1" />
      </div>
    </div>
  );
}

export default async function SetupPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-2xl bg-transparent">
        <Suspense fallback={<LoadingSkeleton />}>
          <SetupClient />
        </Suspense>
      </div>
    </div>
  );
}
