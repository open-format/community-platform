"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type JobStatus = "idle" | "pending" | "processing" | "running" | "completed" | "failed";

interface JobResponse {
  jobId?: string;
  job_id?: string; // For recommendations job
  status: JobStatus;
  error?: string;
  message?: string;
}

interface UsePollingJobOptions {
  startJobEndpoint?: string;
  statusEndpoint: (jobId: string) => string;
  initialJobId?: string;
  onStatusChange?: (status: JobStatus, message?: string) => void;
}

export function usePollingJob({
  startJobEndpoint,
  statusEndpoint,
  initialJobId,
  onStatusChange,
}: UsePollingJobOptions) {
  const [jobId, setJobId] = useState<string | undefined>(initialJobId);

  const startMutation = useMutation<
    JobResponse,
    Error,
    { platformId: string; communityId?: string }
  >({
    mutationFn: async ({ platformId, communityId }) => {
      if (!startJobEndpoint) {
        throw new Error("Start job endpoint not provided");
      }
      const response = await fetch(startJobEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(communityId ? { platformId, communityId } : { platformId }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("[usePollingJob] Failed to start job:", errorText);
        throw new Error("Failed to start job");
      }
      const data = await response.json();
      setJobId(data.jobId || data.job_id);
      return data as JobResponse;
    },
    onError: (error) => {
      console.error("[usePollingJob] Job start error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to start job");
    },
  });

  // Poll job status
  const { data: jobStatus, isLoading: isCheckingStatus } = useQuery<JobResponse | null, Error>({
    queryKey: ["jobStatus", jobId],
    queryFn: async () => {
      if (!jobId) return null;
      const url = statusEndpoint(jobId);
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("[usePollingJob] Failed to fetch job status:", errorText);
        throw new Error("Failed to fetch job status");
      }
      const data = await response.json();
      return data as JobResponse;
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data || data.status === "completed" || data.status === "failed") {
        return false;
      }
      return 2000;
    },
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
  });

  // Handle job status changes
  useEffect(() => {
    if (!jobStatus) return;

    onStatusChange?.(jobStatus.status, jobStatus.message);
  }, [jobStatus, onStatusChange]);

  // Update jobId when initialJobId changes
  useEffect(() => {
    if (initialJobId) {
      setJobId(initialJobId);
    }
  }, [initialJobId]);

  return {
    startJob: startJobEndpoint ? startMutation.mutate : undefined,
    startJobAsync: startJobEndpoint ? startMutation.mutateAsync : undefined,
    status: (jobStatus?.status || "idle") as JobStatus,
    isLoading: (startJobEndpoint ? startMutation.isPending : false) || isCheckingStatus,
    retry: startJobEndpoint ? startMutation.mutate : undefined,
    isError: startJobEndpoint ? startMutation.isError : false,
    message: jobStatus?.message,
    setJobId,
  };
}
