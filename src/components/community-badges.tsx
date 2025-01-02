"use client";

import { chains } from "@/constants/chains";
import { getMetadata } from "@/lib/thirdweb";
import { cn } from "@/lib/utils";
import { ExternalLinkIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AspectRatio } from "./ui/aspect-ratio";
import { buttonVariants } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export default function ProfileBadgeGrid({ badges }: { badges: BadgeWithCollectedStatus[] | undefined }) {
  if (!badges || !badges.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground">This community has no badges yet</p>
      </div>
    );
  }
  return (
    <Card variant="borderless">
      <CardHeader>
        <CardTitle>Badges</CardTitle>
        <CardDescription>Badges available to collect in this community</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {badges.map((badge) => (
          <Item key={badge.id} badge={badge} metadataURI={badge.metadataURI} />
        ))}
      </CardContent>
    </Card>
  );
}

function Item({ badge, metadataURI }: { badge: BadgeWithCollectedStatus; metadataURI: string }) {
  const [metadata, setMetadata] = useState<{ [key: string]: string } | null>(null);
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetadata() {
      try {
        const response = await getMetadata(metadataURI);
        setMetadata(response);
        setImage(response.image);
      } catch (error) {
        console.error("Error fetching metadata:", error);
      }
    }

    fetchMetadata();
  }, [metadataURI]);

  return (
    <Card>
      <CardContent className="flex items-center justify-center p-4">
        <AspectRatio ratio={1 / 1}>
          {image ? (
            <>
              <Image src={image} alt={metadata?.name} fill className="rounded-xl object-cover" />
            </>
          ) : (
            <Skeleton />
          )}
        </AspectRatio>
      </CardContent>
      <CardHeader className="space-y-2">
        <CardTitle>{metadata?.name}</CardTitle>
        <CardDescription>{metadata?.description}</CardDescription>
      </CardHeader>
      <CardFooter>
        {badge.isCollected ? (
          <Link
            className={cn(buttonVariants(), "w-full")}
            href={`${chains.arbitrumSepolia.BLOCK_EXPLORER_URL}/nft/${badge.id}/${badge.tokenId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View
            <ExternalLinkIcon className="w-4 h-4" />
          </Link>
        ) : (
          <div className={cn(buttonVariants({ variant: "outline" }), "w-full opacity-50 pointer-events-none")}>
            Not Collected
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
