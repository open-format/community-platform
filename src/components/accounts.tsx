"use client";

import { usePrivy } from "@privy-io/react-auth";
import { MailIcon, TrashIcon } from "lucide-react";
import { useTranslations } from 'next-intl';
import Image from "next/image";
import Discord from "../../public/icons/discord.svg";
import Google from "../../public/icons/google.svg";
import Telegram from "../../public/icons/telegram.svg";
import { Button } from "./ui/button";
import { toast } from "sonner";

export default function Accounts() {
  const t = useTranslations('accounts');
  const { 
    user, 
    linkDiscord, 
    unlinkDiscord, 
    linkGoogle, 
    unlinkGoogle, 
    linkEmail, 
    unlinkEmail,
    linkTelegram,
    unlinkTelegram 
  } = usePrivy();

  const platforms = [
    {
      id: "discord",
      link: linkDiscord,
      unlink: () => unlinkDiscord(user?.discord?.subject ?? "").catch((error) => alert(error.message)),
      username: user?.discord?.username,
      icon: <Image src={Discord} alt="Discord" width={20} height={20} className="fill-[#5865F2]" />,
    },
    {
      id: "telegram",
      link: linkTelegram,
      unlink: () => unlinkTelegram(user?.telegram?.subject ?? "")
        .catch((error) => toast.error(t('telegram.errors.unlinkFailed'))),
      username: user?.telegram?.username,
      icon: <Image src={Telegram} alt={t('telegram.connect')} width={20} height={20} className="fill-[#2CA5E0]" />,
    },
    {
      id: "google",
      link: linkGoogle,
      unlink: () => unlinkGoogle(user?.google?.subject ?? "").catch((error) => alert(error.message)),
      username: user?.google?.name,
      icon: <Image src={Google} alt="Google" width={20} height={20} />,
    },
    {
      id: "email",
      link: linkEmail,
      unlink: () => unlinkEmail(user?.email?.address ?? "").catch((error) => alert(error.message)),
      username: user?.email?.address,
      icon: <MailIcon className="w-5 h-5" />,
    },
  ];

  return (
    <ul className="flex flex-col space-y-2">
      <h3>{t('title')}</h3>
      {platforms.map((platform) => (
        <li key={platform.id} className="flex items-center justify-between">
          <div className="space-x-2 items-center flex">
            <div className="flex items-center space-x-2">{platform.icon}</div>
            {platform.username ? (
              <span className="text-sm">{platform.username}</span>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={platform.link} 
                className="p-0 hover:bg-transparent"
                aria-label={t(`${platform.id}.ariaLabels.connect`)}
              >
                <span className="capitalize font-semibold hover:underline">
                  {t(`${platform.id}.connect`)}
                </span>
              </Button>
            )}
          </div>
          {platform.username && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={platform.unlink}
              aria-label={t('ariaLabels.disconnect', { service: platform.id })}
            >
              <TrashIcon className="w-4 h-4 text-red-600" />
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}
