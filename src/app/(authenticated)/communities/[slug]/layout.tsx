import { createCommunity } from "@/db";
import { fetchCommunity, getChainFromCommunityOrCookie } from "@/lib/openformat";
import { getTranslations } from 'next-intl/server';
import Link from "next/link";
import type React from "react";
import ActiveLink from "@/components/active-link";

async function handleCommunityCreation(slug: `0x${string}`) {
  const chain = await getChainFromCommunityOrCookie(slug);
  if (chain?.id) {
    await createCommunity(slug, "New Community", chain.id);
  }
}

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const t = await getTranslations('navigation.menu');
  const slug = (await params).slug as `0x${string}`;
  const community = await fetchCommunity(slug);

  if (!community) {
    await handleCommunityCreation(slug);
  }

  return (
    <div>
      <nav className="border-b border-gray-200 flex flex-col px-4 -m-lg">
        <div className="flex">
          <ActiveLink href="overview">{t('overview')}</ActiveLink>
          <ActiveLink href="settings">{t('settings')}</ActiveLink>
          <ActiveLink href="rewards">{t('rewards')}</ActiveLink>
          <ActiveLink href="tokens">{t('tokens')}</ActiveLink>
          <ActiveLink href="badges">{t('badges')}</ActiveLink>
          <ActiveLink href="agents">{t('agents')}</ActiveLink>
        </div>
      </nav>
      <main className="m-lg">{children}</main>
    </div>
  );
}
