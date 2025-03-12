import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function CollectedBadges({ badges }: { badges: Badge[] }) {
  const t = useTranslations("badges.collected");

  return (
    Boolean(badges?.length) && (
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-md">
            {badges?.map((badge) => (
              <div key={badge.id} className="flex items-start space-x-2">
                <img
                  src={badge.metadata.image}
                  alt={t("badgeImageAlt", { name: badge.name })}
                  width={96}
                  height={96}
                  className="rounded-lg"
                />
                <div className="flex flex-col w-full">
                  <span className="font-semibold">{badge.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {badge.metadata.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  );
}
