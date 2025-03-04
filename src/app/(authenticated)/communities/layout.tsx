"use client";

import CommunitySelector from "@/components/community-selector";
import NetworkSelector from "@/components/network-selector";
import Profile from "@/components/profile-header";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Image from "next/image";
import {redirect} from "next/navigation";
import {useTranslations} from "next-intl";
import OFLogo from "../../../../public/images/of-logo.png";
import {useCallback, useState} from "react";
import NewApiKeyDialog from "@/dialogs/new-api-key";

export default function CommunitiesLayout({
                                            children,
                                          }: {
  children: React.ReactNode;
}) {
  const t = useTranslations("layout");
  const [openNewApiKeyDialog, setOpenNewApiKeyDialog] = useState(false);

  function handleLogout() {
    redirect("/logout");
  }

  const toggleNewApiKeyDialog = useCallback(() => {
    setOpenNewApiKeyDialog((open) => !open);
  }, []);

  return (
    <div>
      <nav className="p-5 flex justify-between">
        <div className="flex items-center">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <Image
                  src={OFLogo}
                  alt={t("logo")}
                  width={48}
                  height={48}
                  className="rounded-md"
                />
              </BreadcrumbItem>
              <BreadcrumbSeparator/>
              <BreadcrumbItem>
                <BreadcrumbLink href="/communities">
                  {t("communities")}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator/>
              <BreadcrumbItem>
                <CommunitySelector/>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center space-x-2">
          <NetworkSelector
            callback={() => {
              redirect("/communities");
            }}
            hideIfNotSet
          />
          <Profile
            logoutAction={handleLogout}
            showNewApiKeyDialogAction={toggleNewApiKeyDialog}
          />
        </div>
      </nav>
      <div className="m-lg">{children}</div>

      <NewApiKeyDialog
        open={openNewApiKeyDialog}
        onOpenChange={toggleNewApiKeyDialog}
      />
    </div>
  );
}
