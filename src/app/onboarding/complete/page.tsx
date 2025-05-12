import { getTranslations } from "next-intl/server";
import CompleteClient from "./complete-client";

export default async function CompletePage() {
  const t = await getTranslations();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="text-2xl font-bold mb-2">{t("onboarding.complete.title")}</h1>
        <p className="text-muted-foreground mb-4">{t("onboarding.complete.intro")}</p>
        <CompleteClient />
      </div>
    </div>
  );
} 