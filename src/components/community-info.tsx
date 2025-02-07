import { Card, CardHeader } from "./ui/card";
import { useTranslations } from 'next-intl';

interface CommunityInfoProps {
  title: string;
  description: string;
}

export default function CommunityInfo({ title, description }: CommunityInfoProps) {
  const t = useTranslations('community.info');
  
  return (
    <Card className="min-h-32 rounded-xl">
      <CardHeader>
        <h1 className="text-2xl font-bold" aria-label={t('ariaLabels.title')}>
          {title}
        </h1>
        <p className="text-sm" aria-label={t('ariaLabels.description')}>
          {description}
        </p>
      </CardHeader>
    </Card>
  );
}
