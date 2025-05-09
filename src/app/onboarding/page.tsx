// src/app/onboarding/page.tsx

"use client";

import React, { useState } from "react";
import IntegrationsStep from "./integrations-step";
import ExampleSnapshotStep from "./example-snapshot-step";


function CompleteStep() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl mb-4">Setup Complete!</h1>
      <p className="mb-4">[Placeholder for completion message]</p>
      <a href="/communities" className="btn">Go to Community Dashboard</a>
    </div>
  );
}

const steps = [
  { label: "Example Snapshot", component: ExampleSnapshotStep },
  { label: "Integrations", component: IntegrationsStep },
  { label: "Complete", component: CompleteStep },
];

export default function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const StepComponent = steps[step].component;

  return (
    <div>
      {/* Stepper UI can be added here if desired */}
      <StepComponent onNext={() => setStep(step + 1)} />
    </div>
  );
}
