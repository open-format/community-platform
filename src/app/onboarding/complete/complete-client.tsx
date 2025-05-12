"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

export default function CompleteClient() {
  const t = useTranslations();
  const router = useRouter();

  const handleContinue = () => {
    router.push("/communities");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        <h2 className="text-xl font-semibold mb-2">{t("onboarding.complete.successTitle")}</h2>
        <p className="text-muted-foreground mb-6">
          {t("onboarding.complete.successMessage")}
        </p>
        <Button onClick={handleContinue} size="lg">
          {t("onboarding.complete.continue")}
        </Button>
      </div>
    </div>
  );
} 