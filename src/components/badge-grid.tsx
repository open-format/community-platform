"use client";

import { getMetadata } from "@/lib/thirdweb";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AspectRatio } from "./ui/aspect-ratio";
import { Card, CardContent, CardFooter, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export default function BadgeGrid({ badges }: { badges: Badge[] | undefined }) {
  if (!badges || !badges.length) {
    return <div>Badges not found</div>;
  }
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      {badges.map((badge) => (
        <Item key={badge.id} badge={badge} metadataURI={badge.metadataURI} />
      ))}
    </div>
  );
}

function Item({ badge, metadataURI }: { badge: Badge; metadataURI: string }) {
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
      <CardContent className="mt-5">
        <AspectRatio ratio={1 / 1.2} className="bg-muted rounded-md">
          {image ? <Image src={image} alt={metadata?.name} fill className="rounded-md object-cover" /> : <Skeleton />}
        </AspectRatio>
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-4">
        {metadata?.name ? (
          <div className="flex justify-between items-center w-full">
            <CardTitle>{metadata.name}</CardTitle>
            <CardTitle>{badge.id}</CardTitle>
          </div>
        ) : badge.name ? (
          <CardTitle>{badge.name}</CardTitle>
        ) : (
          <Skeleton />
        )}
      </CardFooter>
    </Card>
  );
}