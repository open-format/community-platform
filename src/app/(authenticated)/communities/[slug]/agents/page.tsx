import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function Agents() {
  return (
    <div className="flex flex-col space-y-12 p-4 lg:p-24 mx-auto text-center items-center justify-center">
      <div className="space-y-2">
        <Badge className="text-xl">coming soon</Badge>
        <p className="text-sm">
          If you&apos;re interested in joining our agents beta, come join us in{" "}
          <Link href="https://discord.com/invite/Aays8HBkZ2" target="_blank" className="underline">
            Discord
          </Link>
          .
        </p>
      </div>
      <div className="pointer-events-none opacity-50 space-y-6">
        <h1 className="text-5xl font-bold">What can I help you with?</h1>
        <Input placeholder="Ask me a question..." className="rounded-lg p-4" />
        <div className="flex gap-2 items-center justify-center">
          <Badge className="gap-1">
            Reward the top GitHub contributors
            <ArrowUpRight className="h-4 w-4" />
          </Badge>
          <Badge className="gap-1">
            Send 10 point tokens to tinypell3ts on Discord
            <ArrowUpRight className="h-4 w-4" />
          </Badge>
          <Badge className="gap-1">
            Who are the new members of the community this week?
            <ArrowUpRight className="h-4 w-4" />
          </Badge>
        </div>
      </div>
    </div>
  );
}
