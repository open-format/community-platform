import { Avatar } from "@/components/ui/avatar";
import { getUserHandle } from "@/lib/privy";
import { addressSplitter } from "@/lib/utils";
import type { Address } from "viem";
import LinkAccounts from "./linkAccounts";

export default async function ProfileComponent({ user, theme }: { user: CurrentUser; theme: Theme }) {
  const userHandle = (await getUserHandle(user.wallet_address as Address))?.username;
  return (
    <div
      className="flex flex-col md:flex-row items-center md:items-center justify-between mb-4 md:mb-8 w-full"
      style={{ backgroundColor: theme.backgroundColor }}
    >
      <div className="flex flex-col md:flex-row items-center md:items-center space-y-3 md:space-y-0 md:space-x-4 w-full md:w-auto mb-6 md:mb-0">
        <Avatar seed={user.wallet_address} />
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold">{userHandle}</h1>
          <p className="text-muted-foreground">{addressSplitter(user.wallet_address)}</p>
        </div>
      </div>
      <LinkAccounts theme={theme} />
    </div>
  );
}
