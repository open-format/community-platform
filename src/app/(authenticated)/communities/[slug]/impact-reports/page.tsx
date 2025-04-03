"use client";

import { ImpactReports } from "@/components/impact-reports";
import { use } from "react";

export default function ImpactReportsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Community Impact Reports</h1>
      <ImpactReports 
        communityId={slug}
        agentId="52c330a1-2261-4191-888e-d26579dadc30" // Example agent ID
      />
    </div>
  );
} 