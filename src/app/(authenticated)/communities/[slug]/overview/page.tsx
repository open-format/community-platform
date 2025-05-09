import MetricsSection from "@/components/metrics-section";
import Shortcuts from "@/components/shortcuts";
import { fetchCommunity } from "@/lib/openformat";
import { getTranslations } from "next-intl/server";

export default async function Overview({ params }: { params: Promise<{ slug: string }> }) {
  const t = await getTranslations("overview");
  const slug = (await params).slug as `0x${string}`;
  const community = await fetchCommunity(slug);

  if (!community) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-6 max-w-prose mx-auto text-muted-foreground">
        <h1 className="text-5xl font-bold mb-4 text-foreground">{t("error.title")}</h1>
        <p className="text-muted-foreground mb-4">{t("error.message")}</p>
        <p>{t("error.action")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Shortcuts community={community} />
      </div>
      <MetricsSection community={community} />
    </div>
  );
}
