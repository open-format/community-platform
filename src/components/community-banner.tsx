import { generateGradient } from "@/lib/utils";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import Image from "next/image";

interface CommunityBannerProps {
  banner_url: string;
  accent_color: string;
}
export function CommunityBanner({ banner_url, accent_color }: CommunityBannerProps) {
  return (
    <div className="w-full">
      <AspectRatio ratio={16 / 9}>
        {banner_url ? (
          <Image
            className="rounded-xl object-cover"
            src={banner_url}
            alt={banner_url}
            fill
            loading="lazy"
            unoptimized
          />
        ) : (
          <div className="w-full h-full rounded-xl" style={{ background: generateGradient(accent_color) }} />
        )}
      </AspectRatio>
    </div>
  );
}
