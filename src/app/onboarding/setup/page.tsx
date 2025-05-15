import { getTranslations } from "next-intl/server";
import SetupClient from "./setup-client";

export default async function SetupPage() {
  const t = await getTranslations("onboarding.setup");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="text-2xl font-bold mb-2">{t("title")}</h1>
        <p className="text-muted-foreground mb-4">{t("description")}</p>
        <SetupClient />
      </div>
    </div>
  );
} 