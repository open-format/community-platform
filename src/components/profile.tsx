"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { timeAgo } from "@/lib/utils";
import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
import Accounts from "./accounts";
import { Button } from "./ui/button";
import Wallets from "./wallets";

export default function Profile({ profile }: { profile: Profile | null }) {
  const { authenticated, logout, user } = usePrivy();

  if (!authenticated && !profile) return null;

  return (
    <div className="max-w-prose container mx-auto p-4">
      <Card className="w-full max-w-3xl mx-auto shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">
                <h1>User Profile</h1>
              </CardTitle>
            </div>
            <Button onClick={logout}>Logout</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <h2>Accounts & Wallets</h2>
          <Accounts />
          {user?.wallet?.address && <Wallets user={user} />}
          {/* Open Format Profile */}
          {profile && (
            <>
              {/* Collected Badges */}
              {Boolean(profile?.collected_badges?.length) && (
                <>
                  <Separator />
                  <h2>Collected Badges</h2>
                  <div className="flex flex-col space-y-4">
                    {profile?.collected_badges.map((badge) => (
                      <div key={badge.id} className="flex items-start space-x-2">
                        <Image
                          src={badge.metadata.image}
                          alt={badge.name}
                          width={96}
                          height={96}
                          className="rounded-lg"
                        />
                        <div className="flex flex-col w-full">
                          <span className="font-semibold">{badge.name}</span>
                          <span className="text-sm text-muted-foreground">{badge.metadata.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
