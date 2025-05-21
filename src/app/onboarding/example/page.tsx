import { agentApiClient } from "@/lib/openformat";
import ExampleSnapshotClient from "./example-client";

async function getExampleReport() {
  const summaryId = process.env.NEXT_PUBLIC_EXAMPLE_REPORT_ID;
  if (!summaryId) {
    throw new Error("Example report ID not configured");
  }
  const response = await agentApiClient.get(`/reports/impact/${summaryId}`);
  return response.data.report;
}

export default async function ExampleSnapshotPage() {
  const report = await getExampleReport();

  return (
    <div className="onboarding-dark flex flex-col items-center justify-center min-h-screen px-4 bg-[#111010]">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-10 mt-8">
          <h1 className="text-3xl font-bold text-white mb-3">Community Snapshot Example</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Here's an example of the insights and reports you'll see after connecting your
            platforms.
          </p>
        </header>
        <main>
          <ExampleSnapshotClient report={report} />
        </main>
      </div>
    </div>
  );
}
