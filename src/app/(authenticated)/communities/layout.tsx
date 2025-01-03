import CommunitySelector from "@/components/community-selector";
import Profile from "@/components/profile-header";
import { ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import OFLogo from "../../../../public/images/of-logo.png";

export default function CommunitiesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav className="p-5 flex justify-between">
        <div className="flex items-center">
          <Image src={OFLogo} alt="Logo" width={48} height={48} className="rounded-md" />

          <ChevronRightIcon className="text-muted-foreground h-4 w-4 mx-1.5" />

          <CommunitySelector />
        </div>
        <Profile />
      </nav>
      <div className="m-lg">{children}</div>
    </div>
  );
}
