"use client";

import {UpdateBadgeForm} from "@/forms/update-badge-form";
import {getMetadata} from "@/lib/thirdweb";
import {addressSplitter, generateGradient, getContrastSafeColor} from "@/lib/utils";
import {useTranslations} from 'next-intl';
import Image from "next/image";
import Link from "next/link";
import {useEffect, useState} from "react";
import {AspectRatio} from "./ui/aspect-ratio";
import {buttonVariants} from "./ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardTitle} from "./ui/card";
import {Skeleton} from "./ui/skeleton";
import {useCurrentChain} from "@/hooks/useCurrentChain";
import {CopyIcon, ExternalLinkIcon} from "lucide-react";
import {toast} from "sonner";
import {useParams} from "next/navigation";

export default function BadgeGrid({badges, communityId}: { badges: Badge[] | undefined; communityId: string }) {
  const t = useTranslations('badges');

  if (!badges || !badges.length) {
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-4">
        <Card className="border-dashed">
          <CardContent className="mt-5">
            <AspectRatio
              ratio={1 / 1.2}
              className="bg-muted/50 rounded-md flex flex-col items-center justify-center"
              style={{background: generateGradient("hello")}}
            >
              <div className="text-4xl mb-2">🏅</div>
              <p className="text-center text-muted-foreground px-4" style={{color: getContrastSafeColor("#FFFFFF")}}>
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
        <Item key={badge.id} badge={badge} metadataURI={badge.metadataURI} communityId={communityId}/>
      ))}
    </div>
  );
}

function Item({badge, metadataURI, communityId}: { badge: Badge; metadataURI: string; communityId: string }) {
  const [metadata, setMetadata] = useState<{ [key: string]: string } | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const t = useTranslations('badges');
  const chain = useCurrentChain();
  const params = useParams();

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

  function copyBadgeAddress() {
    navigator.clipboard.writeText(badge.id || "");
    toast.success(t("addressCopied"));
  }

  return (
    <Card>
      <CardContent className="mt-5">
        <AspectRatio ratio={1 / 1.2} className="bg-muted rounded-md">
          {image ? <Image src={image} alt={metadata?.name} fill className="rounded-md object-cover"/> : <Skeleton/>}
        </AspectRatio>
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-4">
        {metadata?.name ? (
          <div className="flex flex-col justify-between w-full space-y-2">
            <CardTitle>{metadata.name}</CardTitle>
            <CardDescription className="flex">{t('address')} <span>{addressSplitter(badge.id || "")}</span>
              <CopyIcon className="mx-2 cursor-copy" onClick={copyBadgeAddress}/>
              <Link href={`${chain?.BLOCK_EXPLORER_URL}/token/${badge.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t('ariaLabels.viewBadge')}><ExternalLinkIcon/></Link>
            </CardDescription>
            <CardDescription>{metadata.description}</CardDescription>
            <div className="flex gap-2">
              <Link className={buttonVariants()} href={`/${params.chainName}/communities/${communityId}/rewards`}>
                {t('rewardBadge')}
              </Link>
              <UpdateBadgeForm badge={badge} metadata={metadata}/>
            </div>
          </div>
        ) : badge.name ? (
          <CardTitle>{badge.name}</CardTitle>
        ) : (
          <Skeleton/>
        )}
      </CardFooter>
    </Card>
  );
}
