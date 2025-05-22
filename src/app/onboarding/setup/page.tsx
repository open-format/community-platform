import { Suspense } from "react";
import SetupClient from "./setup-client";

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-8 h-full min-h-[600px]">
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
  );
}

export default async function SetupPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      {/* Main Card */}
      <div>
        <Suspense fallback={<LoadingSkeleton />}>
          <SetupClient />
        </Suspense>
      </div>
    </div>
  );
}

