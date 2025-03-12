import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function Agents() {
  const t = await getTranslations("agents");

  return (
    <div className="flex flex-col space-y-12 p-4 lg:p-24 mx-auto text-center items-center justify-center">
      <div className="space-y-2">
        <Badge className="text-xl">{t("comingSoon")}</Badge>
        <p className="text-sm">
          {t("discordInvite")}{" "}
          <Link href="https://discord.com/invite/Aays8HBkZ2" target="_blank" className="underline">
            Discord
          </Link>
          .
        </p>
      </div>
      <div className="pointer-events-none opacity-50 space-y-6">
        <h1 className="text-5xl font-bold">{t("title")}</h1>
        <Input placeholder={t("placeholder")} className="rounded-lg p-4" />
        <div className="flex gap-2 items-center justify-center">
          <Badge className="gap-1">
            {t("suggestions.github")}
            <ArrowUpRight className="h-4 w-4" />
          </Badge>
          <Badge className="gap-1">
            {t("suggestions.discord")}
            <ArrowUpRight className="h-4 w-4" />
          </Badge>
          <Badge className="gap-1">
            {t("suggestions.members")}
            <ArrowUpRight className="h-4 w-4" />
          </Badge>
        </div>
      </div>
    </div>
  );
}
