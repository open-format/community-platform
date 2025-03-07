"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePrivy } from "@privy-io/react-auth";
import { useTranslations } from 'next-intl';
import Image from "next/image";
import Discord from "../../public/icons/discord.svg";
import Github from "../../public/icons/github.svg";
import Telegram from "../../public/icons/telegram.svg";
import { toast } from "sonner";
import { TrashIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

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

  const handleUnlink = async (service: any) => {
    try {
      await service.actions.unlink(user?.[service.id]?.subject ?? "");
      toast.success(t(`${service.id}.unlinked`));
    } catch (error) {
      toast.error(t(`${service.id}.errors.unlinkFailed`));
      console.error('Unlink error:', error);
    }
  };

  const services = [
    {
      id: "discord",
      actions: {
        link: linkDiscord,
        unlink: () => handleUnlink({ id: 'discord', actions: { unlink: unlinkDiscord } }),
      },
      icon: <Image src={Discord} alt="Discord" width={20} height={20} />,
      linkedAccount: user?.discord?.username,
    },
    {
      id: "github",
      actions: {
        link: linkGithub,
        unlink: () => handleUnlink({ id: 'github', actions: { unlink: unlinkGithub } }),
      },
      icon: <Image src={Github} alt="Github" width={20} height={20} />,
      linkedAccount: user?.github?.username,
    },
    {
      id: "telegram",
      actions: {
        link: linkTelegram,
        unlink: () => handleUnlink({ id: 'telegram', actions: { unlink: unlinkTelegram } }),
      },
      icon: <Image src={Telegram} alt="Telegram" width={20} height={20} />,
      linkedAccount: user?.telegram?.username || user?.telegram?.firstName,
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
        <div key={service.id} className="relative">
          <Button
            variant="outline"
            onClick={() => (!service.linkedAccount && authenticated ? service.actions.link() : login())}
            className={cn(
              "bg-background text-foreground w-full px-3",
              service.linkedAccount && "cursor-default hover:bg-background pr-10"
            )}
            disabled={false}
            aria-label={
              service.linkedAccount
                ? t('ariaLabels.connected', { service: service.id, username: service.linkedAccount })
                : t('ariaLabels.connect', { service: service.id })
            }
          >
            <div className="flex items-center justify-between w-full gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                {service.icon}
                <span className="truncate">
                  {service.linkedAccount 
                    ? service.linkedAccount
                    : t('connect', { service: service.id })}
                </span>
              </div>
            </div>
          </Button>
          {service.linkedAccount && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-destructive/90 hover:text-destructive-foreground"
              onClick={() => service.actions.unlink()}
              aria-label={t('ariaLabels.disconnect', { service: service.id })}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}

      