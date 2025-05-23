"use client";

import * as React from "react";

interface Step {
  label: string;
}

export function OnboardingProgressBar({
  steps,
  progresses,
}: {
  steps: Step[];
  progresses: number[];
}) {
  return (
    <div className="flex w-full max-w-3xl mx-auto gap-16 mt-8">
      {steps.map((step, idx) => {
        const progress = progresses[idx] ?? 0;
        const isActive = progress > 0;
        return (
          <div key={step.label} className="flex-1 flex flex-col items-start">
            <div className="w-full mb-2 h-1 rounded bg-zinc-800">
              <div
                className={`h-1 rounded transition-all duration-300 ${isActive ? "bg-yellow-400" : ""}`}
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <span
              className={`font-semibold text-lg ${
                isActive ? "text-yellow-400" : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}