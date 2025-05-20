"use client";

import { useRouter } from "next/navigation";
import { generateImpactReportTestData } from "@/lib/test-data";
import { useTranslations } from "next-intl";
import { ActivityAnalysis } from "@/components/impact-reports/sections/activity-analysis";
import { TopContributors } from "@/components/impact-reports/sections/top-contributors";
import { KeyTopics } from "@/components/impact-reports/sections/key-topics";
import { SentimentAnalysis } from "@/components/impact-reports/sections/sentiment-analysis";
import { Sparkles } from "lucide-react";
import { useState } from "react";

export default function ExampleSnapshotClient() {
  const t = useTranslations("onboarding.example");
  const router = useRouter();
  const report = generateImpactReportTestData();
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Community Overview",
      description: "Key metrics about your community at a glance.",
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
          <div className="rounded-xl border border-zinc-800 p-8 flex flex-col items-center shadow-sm bg-zinc-800">
            <Sparkles className="h-6 w-6 text-yellow-400 mb-2" />
            <span className="text-sm text-gray-400 mb-1">Total Messages</span>
            <span className="text-4xl font-extrabold text-white">{report.overview.totalMessages}</span>
          </div>
          <div className="rounded-xl border border-zinc-800 p-8 flex flex-col items-center shadow-sm bg-zinc-800">
            <Sparkles className="h-6 w-6 text-yellow-400 mb-2" />
            <span className="text-sm text-gray-400 mb-1">Active Channels</span>
            <span className="text-4xl font-extrabold text-white">{report.overview.activeChannels}</span>
          </div>
          <div className="rounded-xl border border-zinc-800 p-8 flex flex-col items-center shadow-sm bg-zinc-800">
            <Sparkles className="h-6 w-6 text-yellow-400 mb-2" />
            <span className="text-sm text-gray-400 mb-1">Unique Participants</span>
            <span className="text-4xl font-extrabold text-white">{report.overview.uniqueUsers}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Activity Analysis",
      description: "See how your community engages over time and across channels.",
      content: (
        <div className="rounded-xl border border-zinc-800 shadow-sm p-6 w-full bg-zinc-800">
          <ActivityAnalysis dailyActivity={report.dailyActivity} channelBreakdown={report.channelBreakdown} />
        </div>
      ),
    },
    {
      title: "Top Contributors & Key Topics",
      description: "Discover your top contributors and trending discussions.",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <div className="rounded-xl border border-zinc-800 shadow-sm p-6 min-h-[340px] flex flex-col bg-zinc-800">
            <TopContributors contributors={report.topContributors} />
          </div>
          <div className="rounded-xl border border-zinc-800 shadow-sm p-6 min-h-[340px] flex flex-col bg-zinc-800">
            <KeyTopics topics={report.keyTopics} />
          </div>
        </div>
      ),
    },
    {
      title: "Sentiment Analysis",
      description: "Understand how your community feels about different topics.",
      content: (
        <div className="rounded-xl border border-zinc-800 shadow-sm p-6 w-full bg-zinc-800">
          <SentimentAnalysis sentiment={report.userSentiment} />
        </div>
      ),
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[70vh] px-4 onboarding-dark">
      <div className="w-full flex flex-col items-center mb-8">
        <div className="flex gap-2 mb-2">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 w-8 rounded-full transition-all duration-200 ${idx === step ? "bg-yellow-400" : "bg-zinc-800"}`}
            />
          ))}
        </div>
        <h2 className="text-xl font-bold text-white mb-1">{steps[step].title}</h2>
        <p className="text-gray-400 text-sm mb-4 text-center max-w-md">{steps[step].description}</p>
      </div>
      <div className="w-full mb-8">{steps[step].content}</div>
      <div className="flex gap-4">
        <button
          className="rounded-lg bg-zinc-800 text-gray-200 font-semibold py-2 px-6 border border-zinc-700 hover:bg-zinc-700 transition-colors duration-150 disabled:opacity-50"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          Previous
        </button>
        {step < steps.length - 1 ? (
          <button
            className="rounded-lg bg-yellow-400 text-black font-semibold py-2 px-6 shadow hover:bg-yellow-300 transition-colors duration-150 disabled:opacity-50"
            onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
          >
            Next
          </button>
        ) : (
          <button
            className="rounded-lg bg-yellow-400 text-black font-semibold py-2 px-6 shadow hover:bg-yellow-300 transition-colors duration-150"
            onClick={() => router.push("/onboarding/integrations")}
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
} 