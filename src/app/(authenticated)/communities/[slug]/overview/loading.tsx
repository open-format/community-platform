import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Loading() {
  const t = useTranslations("overview");

  return (
    <div className="flex flex-col items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin" />
    </div>
  );
}
