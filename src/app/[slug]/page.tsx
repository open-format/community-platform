import { CommunityBanner } from "@/components/community-banner";
import CommunityInfo from "@/components/community-info";
import CommunityProfile from "@/components/community-profile";
import Leaderboard from "@/components/leaderboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { getCommunity } from "../actions/communities/get";

export default async function CommunityPage({ params }: { params: Promise<{ slug: string }> }) {
  const t = await getTranslations("community");
  const slug = (await params).slug;
  const community = await getCommunity(slug);

  if (!community) {
    return (
      <div className="text-center min-h-[100vh] flex flex-col items-center justify-center p-12 rounded-lg bg-background text-foreground space-y-8">
        <h2 className="text-4xl md:text-5xl font-bold">
          {t("notFound.title")} <span className="inline-block animate-look-around">👀</span>
        </h2>
        <p className="text-xl max-w-2xl">{t("notFound.description")}</p>
        <Link
          href="/auth"
          className="inline-block px-8 py-4 text-lg rounded-lg border hover:bg-foreground/10 transition-colors"
        >
          {t("notFound.createCommunity")}
        </Link>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "max-w-prose mx-auto space-y-4 p-5 rounded-xl bg-background sticky top-0 ",
        community?.darkMode ? "dark" : "light",
      )}
    >
      {/* Community Profile */}
      <CommunityProfile />

      {/* Community Banner */}
      <CommunityBanner bannerUrl={community.bannerUrl} accentColor={community.accentColor} />

      {/* Community Info */}
      <CommunityInfo title={community.name} description={community.description} />

      <Tabs defaultValue="leaderboard" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="leaderboard" className="w-full">
            {t("preview.tabs.leaderboard")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="leaderboard">
          <Leaderboard community={community} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
