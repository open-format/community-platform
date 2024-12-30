import { cn } from "@/lib/utils";
import Link from "next/link";
import Profile from "./profile-header";
import { Avatar } from "./ui/avatar";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
    icon: React.ReactNode;
  }[];
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  return (
    <nav
      className={cn("w-64 flex flex-col bg-gray-100 h-screen justify-between p-xl border-r border-gray-200", className)}
      {...props}
    >
      <div className="flex flex-col space-y-xl">
        <div className="flex space-x-2 items-center">
          <Avatar seed="openformat" className="w-10 h-10" />
          <p className="text-sm">Open Format Rewards</p>
        </div>
        {items.map((item) => (
          <Link className="flex items-center space-x-2 font-bold" key={item.href} href={item.href}>
            {item.icon}
            <p>{item.title}</p>
          </Link>
        ))}
      </div>

      <Profile />
    </nav>
  );
}
