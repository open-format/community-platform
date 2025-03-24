import SetupAgent from "@/components/setup-agent";
import { fetchAgentWallet, fetchCommunity } from "@/lib/openformat";
import { getTranslations } from "next-intl/server";

export default async function Agents({ params }: { params: Promise<{ slug: string }> }) {
  const t = await getTranslations("agents");
  const { slug } = await params;
  const community = await fetchCommunity(slug);
  const agentWallet = await fetchAgentWallet(slug);

  if (!community) {
    return <div>Community not found</div>;
  }

  // @TODO: Add translations
  return (
    <div>
      <SetupAgent community={community} agentWallet={agentWallet} />
    </div>
  );
}
