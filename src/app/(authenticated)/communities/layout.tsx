"use client";

import Profile from "@/components/profile-header";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { redirect } from "next/navigation";
import OFLogo from "../../../../public/images/of-logo.jpg";

export default function CommunitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("layout");

  function handleLogout() {
    redirect("/logout");
  }

  return (
    <div>
      <nav className="p-5 flex justify-between">
        <div className="flex items-center">
          <Image src={OFLogo} alt={t("logo")} width={48} height={48} className="rounded-md" />
        </div>
        <div className="flex items-center space-x-2">
          <Profile logoutAction={handleLogout} />
        </div>
      </nav>
      <div className="m-lg">{children}</div>
    </div>
  );
}
