import { getTranslations } from "next-intl/server";
import SetupClient from "./setup-client";
import { Suspense } from "react";

export default async function SetupPage() {

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-[#111010]">
      {/* Progress Bar */}
      <div className="w-full max-w-2xl flex items-center gap-4 mb-8 mt-8">
        <div className="flex-1 flex gap-0">
        <div className="h-2 w-[90%] rounded-r bg-yellow-400" />
          <div className="h-2 w-[10%] rounded-l bg-zinc-800" />
        </div>
      </div>
      {/* Main Card */}
      <div className="w-full max-w-2xl bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-800">
        <Suspense fallback={<div>Loading setup...</div>}>
          <SetupClient />
        </Suspense>
      </div>
    </div>
  );
} 