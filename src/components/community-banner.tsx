import { generateGradient } from "@/lib/utils";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import { useTranslations } from 'next-intl';
import Image from "next/image";

interface CommunityBannerProps {
  banner_url: string;
  accent_color: string;
}

export function CommunityBanner({ banner_url, accent_color }: CommunityBannerProps) {
  const t = useTranslations('community.banner');
  
  return (
    <div className="w-full">
      <AspectRatio ratio={16 / 9}>
        {banner_url ? (
          <Image
            className="rounded-xl object-cover"
            src={banner_url}
            alt={t('bannerImageAlt')}
            fill
            loading="lazy"
            unoptimized
          />
        ) : (
          <div 
            className="w-full h-full rounded-xl" 
            style={{ background: generateGradient(accent_color) }}
            aria-label={t('gradientBannerAlt')}
          />
        )}
      </AspectRatio>
    </div>
  );
}
