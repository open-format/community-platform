import { Card, CardHeader } from "./ui/card";

interface CommunityInfoProps {
  title: string;
  description: string;
}
export default function CommunityInfo({ title, description }: CommunityInfoProps) {
  return (
    <Card className="min-h-32 rounded-xl">
      <CardHeader>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm">{description}</p>
      </CardHeader>
    </Card>
  );
}
