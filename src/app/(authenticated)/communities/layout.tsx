import { ModeToggle } from "@/components/mode-toggle";
import Profile from "@/components/profile-header";

export default function CommunitiesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header className="hidden md:flex justify-end p-2 top-0 w-full items-center">
        <Profile />
        <ModeToggle />
      </header>
      <div className="p-lg">{children}</div>
    </div>
  );
}
