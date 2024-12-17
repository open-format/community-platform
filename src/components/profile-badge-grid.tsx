"use client";

import { chains } from "@/constants/chains";
import { getMetadata } from "@/lib/thirdweb";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AspectRatio } from "./ui/aspect-ratio";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardFooter, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export default function ProfileBadgeGrid({ badges }: { badges: BadgeWithCollectedStatus[] | undefined }) {
  if (!badges || !badges.length) {
    return <div>Badges not found</div>;
  }
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {badges.map((badge) => (
        <Item key={badge.id} badge={badge} metadataURI={badge.metadataURI} />
      ))}
    </div>
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
    <Link
      href={`${chains.arbitrumSepolia.BLOCK_EXPLORER_URL}/nft/${badge.id}/${badge.tokenId}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Card>
        <CardContent className="mt-5">
          <Badge>{badge.isCollected ? "Collected" : "Not Collected"}</Badge>
          <AspectRatio ratio={1 / 1.2} className="bg-muted rounded-md">
            {image ? <Image src={image} alt={metadata?.name} fill className="rounded-md object-cover" /> : <Skeleton />}
          </AspectRatio>
        </CardContent>
        <CardFooter className="flex flex-col items-start space-y-4">
          {metadata?.name ? (
            <div className="flex justify-between items-center w-full">
              <CardTitle className="text-lg">{metadata.name}</CardTitle>
            </div>
          ) : badge.name ? (
            <CardTitle>{badge.name}</CardTitle>
          ) : (
            <Skeleton />
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
