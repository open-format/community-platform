import { useTranslations } from "next-intl";
import { Card, CardHeader } from "./ui/card";

interface CommunityInfoProps {
  title: string;
  description: string;
}

export default function CommunityInfo({ title, description }: CommunityInfoProps) {
  const t = useTranslations("community.info");

  function FormattedDescription({ description }: { description?: string }) {
    if (!description) return null;

    // Split the description by double newline to create paragraphs
    const paragraphs = description.split("\n\n").filter((p) => p.trim() !== "");

    return (
      <div>
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="mb-2">
            {paragraph}
          </p>
        ))}
      </div>
    );
  }

  return (
    <Card className="min-h-32 rounded-xl">
      <CardHeader>
        <h1 className="text-2xl font-bold" aria-label={t("ariaLabels.title")}>
          {title}
        </h1>
        <p className="text-sm" aria-label={t("ariaLabels.description")}>
          <FormattedDescription description={description} />
        </p>
      </CardHeader>
    </Card>
  );
}
