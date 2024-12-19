"use client";

import { usePrivy } from "@privy-io/react-auth";
import { MailIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import Discord from "../../public/icons/discord.svg";
import Google from "../../public/icons/google.svg";
import { Button } from "./ui/button";

export default function Accounts() {
  const { user, linkDiscord, unlinkDiscord, linkGoogle, unlinkGoogle, linkEmail, unlinkEmail } = usePrivy();

  const platforms = [
    {
      id: "discord",
      link: linkDiscord,
      unlink: () => unlinkDiscord(user?.discord?.subject ?? "").catch((error) => alert(error.message)),
      username: user?.discord?.username,
      icon: <Image src={Discord} alt="Discord" width={20} height={20} className="fill-[#5865F2]" />,
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
      <h3>Accounts</h3>
      {platforms.map((platform) => (
        <li key={platform.id} className="flex items-center justify-between">
          <div className="space-x-2 items-center flex">
            <div className="flex items-center space-x-2">{platform.icon}</div>
            {platform.username ? (
              <span className="text-sm">{platform.username}</span>
            ) : (
              <Button variant="ghost" size="sm" onClick={platform.link} className="p-0 hover:bg-transparent">
                <span className="capitalize font-semibold hover:underline">Connect {platform.id}</span>
              </Button>
            )}
          </div>
          {platform.username && (
            <Button variant="ghost" size="sm" onClick={platform.unlink}>
              <TrashIcon className="w-4 h-4 text-red-600" />
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}
