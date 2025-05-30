"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface ActiveLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export default function ActiveLink({ href, children, className }: ActiveLinkProps) {
  const pathname = usePathname();
  const isActive = pathname.endsWith(`/${href}`);

  return (
    <Link
      href={href}
      className={cn(
        "px-3 py-4 text-sm transition-colors hover:text-white",
        isActive ? "text-primary font-semibold border-b-2 border-primary" : "text-gray-500",
        className,
      )}
    >
      {children}
    </Link>
  );
}
