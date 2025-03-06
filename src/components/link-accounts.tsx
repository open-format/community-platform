"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePrivy } from "@privy-io/react-auth";
import { useTranslations } from 'next-intl';
import Image from "next/image";
import Discord from "../../public/icons/discord.svg";
import Github from "../../public/icons/github.svg";
import Telegram from "../../public/icons/telegram.svg";

export default function LinkAccounts() {
  const t = useTranslations('accounts');
  const { 
    user, 
    linkDiscord, 
    unlinkDiscord, 
    linkGithub, 
    unlinkGithub,
    linkTelegram,
    unlinkTelegram,
    ready, 
    login, 
    authenticated 
  } = usePrivy();

  const services = [
    {
      id: "discord",
      actions: {
        link: linkDiscord,
        unlink: unlinkDiscord,
      },
      icon: <Image src={Discord} alt="Discord" width={20} height={20} />,
      linkedAccount: user?.discord?.username,
    },
    {
      id: "github",
      actions: {
        link: linkGithub,
        unlink: unlinkGithub,
      },
      icon: <Image src={Github} alt="Github" width={20} height={20} />,
      linkedAccount: user?.github?.username,
    },
    {
      id: "telegram",
      actions: {
        link: linkTelegram,
        unlink: unlinkTelegram,
      },
      icon: <Image src={Telegram} alt="Telegram" width={20} height={20} />,
      linkedAccount: user?.telegram?.username,
    },
  ];

  if (!ready)
    return (
      <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
        {services.map((service) => (
          <Skeleton key={service.id} className="h-10 w-32 px-4 py-2 rounded-md border border-input bg-foreground/10" />
        ))}
      </div>
    );

  return (
    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
      {services.map((service) => (
        <Button
          key={service.id}
          variant="outline"
          onClick={() => (authenticated ? service.actions.link() : login())}
          className="bg-background text-foreground"
          disabled={Boolean(service.linkedAccount)}
          aria-disabled={Boolean(service.linkedAccount)}
          aria-label={
            service.linkedAccount
              ? t('ariaLabels.connected', { service: service.id, username: service.linkedAccount })
              : t('ariaLabels.connect', { service: service.id })
          }
        >
          {service.linkedAccount ? (
            <>
              <div className="flex items-center gap-2">
                {service.icon}
                {service.linkedAccount}
              </div>
              <span className="sr-only">{t('connected', { service: service.id })}</span>
            </>
          ) : (
            <span className="capitalize">{t('connect', { service: service.id })}</span>
          )}
        </Button>
      ))}
    </div>
  );
}
