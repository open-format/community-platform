import ImpactReports from "@/components/impact-reports/impact-reports";

export default function ImpactReportsPage({ params }: { params: { slug: string } }) {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Community Impact Reports</h1>
      <ImpactReports
        communityId={params.slug}
        agentId="52c330a1-2261-4191-888e-d26579dadc30" // Example agent ID
      />
    </div>
  );
}
