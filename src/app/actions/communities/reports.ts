"use server";

import { agentApiClient, throwHTTPErrors } from "@/lib/api";

export async function getCommunityImpactReports(id: string, limit: number = 1000): Promise<ImpactReport[]> {
  try {
    const response = await agentApiClient.get(`/reports/impact?limit=${limit}&communityId=${id}`);
    const apiReports: ImpactReport[] = response.data.impact_reports ?? [];
    const platformReports = new Map<string, ImpactReport>();
    const combinedReports = new Map<string, ImpactReport>();

    if (apiReports && apiReports.length > 0) {
      apiReports.forEach(report => {
        if (report.isCombined) {
          if ( !combinedReports.has(report.communityId) || (combinedReports.get(report.communityId)!.timestamp < report.timestamp) ) {
            // Combined report for community does not exists or is older than current
            combinedReports.set(report.communityId, report);
          }
        } else {
          if ( !platformReports.has(report.platformId!) || (platformReports.get(report.platformId!)!.timestamp < report.timestamp) ) {
            // Platform report does not exists or is older than current
            platformReports.set(report.platformId!, report);
          }
        }
      });
    }

    const reports = Array.from(combinedReports.values())
    reports.push(...Array.from(platformReports.values()));

    return reports;

  } catch (error) {
    console.error("Failed to fetch community impact reports:", error);
    throwHTTPErrors("Get Community Impact Report", error);
    // Handle network errors or other non-HTTP errors
    throw new Error("Failed to fetch community impact reports", { cause: error });
  }
}
