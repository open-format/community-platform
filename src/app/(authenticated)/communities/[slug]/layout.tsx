import { getCommunity } from "@/app/actions/communities/get";
import ActiveLink from "@/components/active-link";
import { getTranslations } from "next-intl/server";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const t = await getTranslations("navigation.menu");
  const slug = (await params).slug as `0x${string}`;
  const community = await getCommunity(slug);
  const onChainData = community.onchainData;

  return (
    <div>
      <nav className="flex flex-col px-4 -m-lg max">
        <div className="flex">
          <ActiveLink href="overview">{t("overview")}</ActiveLink>
          <ActiveLink href="copilot">{t("copilot")}</ActiveLink>
          <ActiveLink href="rewards">{t("rewards")}</ActiveLink>
          <ActiveLink href="tokens">{t("tokens")}</ActiveLink>
          <ActiveLink href="badges">{t("badges")}</ActiveLink>
          {onChainData && <ActiveLink href="settings">{t("settings")}</ActiveLink>}
        </div>
      </nav>
      <main className="m-lg p-lg max-w-7xl mx-auto">{children}</main>
    </div>
  );
}
