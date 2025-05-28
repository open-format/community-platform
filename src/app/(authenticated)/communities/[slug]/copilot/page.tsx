import { getCommunity } from "@/app/actions/communities/get";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import RewardRecommendations from "../overview/components/reward-recommendations";

export default async function CopilotPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const community = await getCommunity(slug);

  return (
    <div className="space-y-6">
      {/* Ask Copilot Section */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-yellow-400" />
            <CardTitle className="text-xl">Ask Your Community Copilot</CardTitle>
          </div>
          <CardDescription className="text-zinc-400">
            Get instant insights about your community by asking questions in Discord
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
              <p className="text-sm text-zinc-300 mb-2">
                Simply mention @copilot followed by your question:
              </p>
              <div className="bg-zinc-900 rounded p-3 border border-zinc-700">
                <code className="text-yellow-400">
                  @copilot Who are the most active contributors this week?
                </code>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-zinc-300">Example Questions:</h4>
                <ul className="text-sm text-zinc-400 space-y-1">
                  <li>• Who are the top contributors?</li>
                  <li>• What are the key topics discussed this week?</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reward Recommendations Section */}
      <div className="space-y-4">
        <h1>Reward Recommendations</h1>
        <RewardRecommendations community={community} />
      </div>
    </div>
  );
}
