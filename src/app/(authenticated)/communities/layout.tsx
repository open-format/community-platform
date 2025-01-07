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
import { redirect } from "next/navigation";
import OFLogo from "../../../../public/images/of-logo.png";

export default function CommunitiesLayout({ children }: { children: React.ReactNode }) {
  function handleLogout() {
    redirect("/logout");
  }
  return (
    <div>
      <nav className="p-5 flex justify-between">
        <div className="flex items-center">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <Image src={OFLogo} alt="Logo" width={48} height={48} className="rounded-md" />
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/communities">Communities</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <CommunitySelector />
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center space-x-2">
          <NetworkSelector />
          <Profile logoutAction={handleLogout} />
        </div>
      </nav>
      <div className="m-lg">{children}</div>
    </div>
  );
}
