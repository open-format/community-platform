import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import SetupClient from "./setup-client";

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-8 bg-zinc-900">
      <div className="flex flex-col items-center mb-4">
        <Loader2 className="h-12 w-12 text-yellow-400 mb-2 animate-spin" />
        <div className="h-8 w-48 bg-zinc-800 rounded animate-pulse mb-1" />
        <div className="h-4 w-64 bg-zinc-800 rounded animate-pulse" />
      </div>
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-start gap-4 rounded-xl border border-zinc-800  px-5 py-4"
          >
            <div className="h-5 w-5 bg-zinc-800 rounded animate-pulse" />
            <div className="flex-1">
              <div className="h-5 w-32 bg-zinc-800 rounded animate-pulse mb-2" />
              <div className="h-4 w-48 bg-zinc-800 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function SetupPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      {/* Main Card */}
      <div >
        <Suspense fallback={<LoadingSkeleton />}>
          <SetupClient />
        </Suspense>
      </div>
    </div>
  );
}
