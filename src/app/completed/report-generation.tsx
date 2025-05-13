"use client";

import { Button } from "@/components/ui/button";
import { usePollingJob } from "@/hooks/useJobStatus";
import { CheckCircle, Loader2 } from "lucide-react";
import { useEffect } from "react";

export function ReportGeneration() {
	const { startJob, status, isLoading, retry, isError } = usePollingJob({
		// TODO: get platformId from community
		startJobEndpoint: "/api/reports/create?platformId=932238833146277958",
		statusEndpoint: (jobId) => `/api/reports/status?jobId=${jobId}`,
	});

	useEffect(() => {
		startJob();
	}, [startJob]);

	return (
		<div className="border p-4 rounded-md">
			<h1>Impact Report</h1>
			<p>
				Generate a report to see the impact of your platform on your business.
			</p>
			{isLoading && <Loader2 className="animate-spin" />}
			{status === "processing" && <Loader2 className="animate-spin" />}
			{status === "completed" && <CheckCircle className="text-green-500" />}
			{isError && <p>There was an error generating the report.</p>}
			{isError && <Button onClick={retry}>Retry</Button>}
		</div>
	);
}
