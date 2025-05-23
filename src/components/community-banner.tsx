import { generateGradient } from "@/lib/utils";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import { useTranslations } from "next-intl";
import Image from "next/image";

interface CommunityBannerProps {
  bannerUrl: string;
  accentColor: string;
}

export function CommunityBanner({ bannerUrl, accentColor }: CommunityBannerProps) {
  const t = useTranslations("community.banner");

  return (
    <div className="w-full">
      <AspectRatio ratio={16 / 9}>
        {bannerUrl ? (
          <Image
            className="rounded-xl object-cover"
            src={bannerUrl}
            alt={t("bannerImageAlt")}
            fill
            loading="lazy"
            unoptimized
          />
        ) : (
          <div
            className="w-full h-full rounded-xl"
            style={{ background: generateGradient(accentColor) }}
            aria-label={t("gradientBannerAlt")}
          />
        )}
      </AspectRatio>
    </div>
  );
}
