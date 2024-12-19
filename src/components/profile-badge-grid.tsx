"use client";

import { chains } from "@/constants/chains";
import { getMetadata } from "@/lib/thirdweb";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AspectRatio } from "./ui/aspect-ratio";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export default function ProfileBadgeGrid({
  badges,
  theme,
}: {
  badges: BadgeWithCollectedStatus[] | undefined;
  theme: Theme;
}) {
  if (!badges || !badges.length) {
    return <div>Badges not found</div>;
  }
  return (
    <Card variant="outline" style={theme}>
      <CardHeader>
        <CardTitle>Badges</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {badges.map((badge) => (
          <Item key={badge.id} badge={badge} metadataURI={badge.metadataURI} theme={theme} />
        ))}
      </CardContent>
    </Card>
  );
}

function Item({ badge, metadataURI, theme }: { badge: BadgeWithCollectedStatus; metadataURI: string; theme: Theme }) {
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
      <Card style={theme}>
        <CardContent className="mt-5 space-y-md">
          <Badge style={{ backgroundColor: theme.borderColor, color: theme.backgroundColor }}>
            {badge.isCollected ? "Collected" : "Not Collected"}
          </Badge>
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
