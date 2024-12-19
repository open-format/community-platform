"use client";

import { Button } from "@/components/ui/button";
import { getContrastSafeColor } from "@/lib/utils";
import { usePrivy } from "@privy-io/react-auth";
import { CheckIcon } from "lucide-react";

export default function LinkAccounts({ theme }: { theme: Theme }) {
  const { user, linkDiscord, unlinkDiscord, linkTelegram, unlinkTelegram, exportWallet } = usePrivy();

  const services = [
    {
      id: "discord",
      actions: {
        link: linkDiscord,
        unlink: unlinkDiscord,
      },
      isLinked: Boolean(user?.discord?.username),
    },
    {
      id: "telegram",
      actions: {
        link: linkTelegram,
        unlink: unlinkTelegram,
      },
      isLinked: Boolean(user?.telegram?.username),
    },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
      {services.map((service) => (
        <Button
          style={{
            backgroundColor: !service.isLinked ? theme.buttonColor : theme.backgroundColor,
            color: !service.isLinked ? getContrastSafeColor(theme.buttonColor) : theme.color,
          }}
          key={service.id}
          variant={service.isLinked ? "outline" : "default"}
          onClick={() => service.actions.link()}
          className="capitalize"
          disabled={service.isLinked}
        >
          {service.isLinked && <CheckIcon className="h-4 w-4" />}
          {service.isLinked ? `${service.id} Connected` : `Connect ${service.id}`}
        </Button>
      ))}
      <Button
        onClick={exportWallet}
        style={{ backgroundColor: theme.buttonColor, color: getContrastSafeColor(theme.buttonColor) }}
      >
        Export Wallet
      </Button>
    </div>
  );
}
