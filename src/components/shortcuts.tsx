"use client";

import { usePrivy } from "@privy-io/react-auth";
import { CopyIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import posthog from "posthog-js";
import { toast } from "sonner";
import { Button, buttonVariants } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";

interface OnboardingProps {
  community: Community;
}

export default function Onboarding({ community }: OnboardingProps) {
  const t = useTranslations("shortcuts");
  const { user } = usePrivy();

  function handleShortcutClick(type: string) {
    posthog.capture?.("shortcut_clicked", {
      type,
      userId: user?.id || null,
      communityId: community?.id || null,
    });
  }

  function copyInviteLink() {
    const baseUrl = window.location.origin;
    const inviteLink = `${baseUrl}/${community?.metadata?.slug}`;
    navigator.clipboard.writeText(inviteLink);
    toast.success(t("configureCommunity.inviteCopied"));
    handleShortcutClick("copy_invite_link");
  }
  return (
    <div className="space-y-4 py-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Send your first reward */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>{t("rewardCommunity.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{t("rewardCommunity.description")}</p>
          </CardContent>
          <CardFooter className="flex space-x-2">
            <Link
              className={buttonVariants()}
              href={`/communities/${community?.metadata?.slug}/rewards`}
              onClick={() => handleShortcutClick("send_reward")}
            >
              {t("rewardCommunity.sendReward")}
            </Link>
          </CardFooter>
        </Card>
        {/* Configure and share community page */}
        {community.communityContractAddress && (
          <Card className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle>{t("configureCommunity.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{t("configureCommunity.description")}</p>
            </CardContent>
            <CardFooter className="flex space-x-2">
              <Link
                className={buttonVariants()}
                href={`/communities/${community?.slug}/settings`}
                onClick={() => handleShortcutClick("configure_community")}
              >
                {t("configureCommunity.configure")}
              </Link>
              {community?.slug && (
                <Button variant="outline" onClick={copyInviteLink}>
                  {t("configureCommunity.copyInvite")}
                  <CopyIcon className="w-4 h-4" />
                </Button>
              )}
            </CardFooter>
          </Card>
        )}

        {/* 2. Create Badges & Tokens */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>{t("createBadgesTokens.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{t("createBadgesTokens.description")}</p>
          </CardContent>
          <CardFooter className="flex space-x-2">
            <Link
              className={buttonVariants()}
              href={`/communities/${community?.id}/badges`}
              onClick={() => handleShortcutClick("create_badges")}
            >
              {t("createBadgesTokens.createBadges")}
            </Link>
            <Link
              className={buttonVariants()}
              href={`/communities/${community?.id}/tokens`}
              onClick={() => handleShortcutClick("create_tokens")}
            >
              {t("createBadgesTokens.createTokens")}
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
