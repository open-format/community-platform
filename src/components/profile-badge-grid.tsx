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
    <Card variant="borderless" style={theme}>
      <CardHeader>
        <CardTitle>Badges</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6">
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
    <Card variant="borderless" style={theme}>
      <Link
        href={`${chains.arbitrumSepolia.BLOCK_EXPLORER_URL}/nft/${badge.id}/${badge.tokenId}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <CardContent className="flex items-center justify-center p-sm">
          <AspectRatio ratio={1}>
            {image ? (
              <>
                <Image src={image} alt={metadata?.name} fill className="rounded-full object-cover" />
                {!badge.isCollected && <div className="absolute inset-0 bg-black bg-opacity-70 rounded-full" />}
              </>
            ) : (
              <Skeleton />
            )}
          </AspectRatio>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center w-full text-center whitespace-nowrap">
          {metadata?.name ? (
            <Badge variant="outline" style={{ color: theme.color }}>
              {metadata.name}
            </Badge>
          ) : badge.name ? (
            <Badge variant="outline" style={{ color: theme.color }}>
              {badge.name}
            </Badge>
          ) : (
            <Skeleton />
          )}
        </CardFooter>
      </Link>
    </Card>
  );
}
