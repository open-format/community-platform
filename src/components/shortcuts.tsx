"use client";

import { CopyIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button, buttonVariants } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";

interface OnboardingProps {
  community: Community;
}

export default function Onboarding({ community }: OnboardingProps) {
  function copyInviteLink() {
    const baseUrl = window.location.origin;
    const inviteLink = `${baseUrl}/${community?.metadata?.slug}`;
    navigator.clipboard.writeText(inviteLink);
    toast.success("Invite link copied to clipboard");
  }
  return (
    <div className="space-y-4 py-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Configure and share community page */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Configure and share community page</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Configure your community page and share it with your members.</p>
          </CardContent>
          <CardFooter className="flex space-x-2">
            <Link className={buttonVariants()} href={`/communities/${community?.metadata?.slug}/settings`}>
              Configure
            </Link>
            {community?.metadata?.slug && (
              <Button variant="outline" onClick={copyInviteLink}>
                Copy invite link
                <CopyIcon className="w-4 h-4" />
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* 2. Create Badges & Tokens */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Create Badges & Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Create badges and tokens you can reward to your community.</p>
          </CardContent>
          <CardFooter className="flex space-x-2">
            <Link className={buttonVariants()} href={`/communities/${community?.metadata?.slug}/badges`}>
              Create badges
            </Link>
            <Link className={buttonVariants()} href={`/communities/${community?.metadata?.slug}/tokens`}>
              Create tokens
            </Link>
          </CardFooter>
        </Card>
        {/* 3. Send your first reward */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Reward your community</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Reward your community for their contributions.</p>
          </CardContent>
          <CardFooter className="flex space-x-2">
            <Link className={buttonVariants()} href={`/communities/${community?.metadata?.slug}/rewards`}>
              Send reward
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
