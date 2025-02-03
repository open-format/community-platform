"use client";

import { UpdateBadgeForm } from "@/forms/update-badge-form";
import { getMetadata } from "@/lib/thirdweb";
import { generateGradient, getContrastSafeColor } from "@/lib/utils";
import { useTranslations } from 'next-intl';
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AspectRatio } from "./ui/aspect-ratio";
import { buttonVariants } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export default function BadgeGrid({ badges, communityId }: { badges: Badge[] | undefined; communityId: string }) {
  const t = useTranslations('badges');

  if (!badges || !badges.length) {
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-4">
        <Card className="border-dashed">
          <CardContent className="mt-5">
            <AspectRatio
              ratio={1 / 1.2}
              className="bg-muted/50 rounded-md flex flex-col items-center justify-center"
              style={{ background: generateGradient("hello") }}
            >
              <div className="text-4xl mb-2">🏅</div>
              <p className="text-center text-muted-foreground px-4" style={{ color: getContrastSafeColor("#FFFFFF") }}>
                {t('createFirst')}
              </p>
            </AspectRatio>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {badges.map((badge) => (
        <Item key={badge.id} badge={badge} metadataURI={badge.metadataURI} communityId={communityId} />
      ))}
    </div>
  );
}

function Item({ badge, metadataURI, communityId }: { badge: Badge; metadataURI: string; communityId: string }) {
  const [metadata, setMetadata] = useState<{ [key: string]: string } | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const t = useTranslations('badges');

  useEffect(() => {
    async function fetchMetadata() {
      try {
        const response = await getMetadata(metadataURI);
        setMetadata(response);
        setImage(response.image);
      } catch (error) {
        console.error(t('errors.fetchMetadata'), error);
      }
    }

    fetchMetadata();
  }, [metadataURI, t]);

  return (
    <Card>
      <CardContent className="mt-5">
        <AspectRatio ratio={1 / 1.2} className="bg-muted rounded-md">
          {image ? <Image src={image} alt={metadata?.name} fill className="rounded-md object-cover" /> : <Skeleton />}
        </AspectRatio>
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-4">
        {metadata?.name ? (
          <div className="flex flex-col justify-between w-full space-y-2">
            <CardTitle>{metadata.name}</CardTitle>
            <CardDescription>{metadata.description}</CardDescription>
            <div className="flex gap-2">
              <Link className={buttonVariants()} href={`/communities/${communityId}/rewards`}>
                {t('rewardBadge')}
              </Link>
              <UpdateBadgeForm badge={badge} metadata={metadata} />
            </div>
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
