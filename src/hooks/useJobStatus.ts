import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

type UsePollingJobProps = {
	startJobEndpoint: string; // API endpoint to start the job
	statusEndpoint: (jobId: string) => string; // Function to generate status endpoint using jobId
	pollInterval?: number; // How often to poll (ms), default 2000
	completeStatus?: string; // What status means "done", default 'completed'
};

/**
 * A reusable hook that starts a job and polls for its status until completed.
 */
export const usePollingJob = ({
	startJobEndpoint,
	statusEndpoint,
	pollInterval = 2000,
	completeStatus = "completed",
}: UsePollingJobProps) => {
	const queryClient = useQueryClient();

	// Starts the job by calling the provided startJobEndpoint.
	const startJob = async () => {
		const { data } = await axios.post(startJobEndpoint);
		return data.data.jobId; // Expecting { jobId: 'xyz' }
	};

	// Fetches the current status of the job using the jobId.
	const getJobStatus = async (jobId: string) => {
		const { data } = await axios.get(statusEndpoint(jobId));
		return data.data.status; // Expecting { status: 'in_progress' }
	};

	// Mutation to handle starting the job.
	const jobMutation = useMutation({ mutationFn: startJob });

	// Query to poll job status, runs only after jobMutation has data (jobId).
	const statusQuery = useQuery({
		queryKey: ["job-status", jobMutation.data], // Depends on jobId
		queryFn: () => getJobStatus(jobMutation.data), // Safe because of enabled
		enabled: !!jobMutation.data, // Don't run until we have a jobId
		refetchInterval: (data) => {
			console.log({ status: data });

			// Stop polling when status is 'completed'
			if (data?.state.data === completeStatus) return false;
			return pollInterval; // Otherwise, keep polling
		},
	});

	// Retry function resets everything to initial state
	const retry = () => {
		jobMutation.reset();
		queryClient.removeQueries({
			queryKey: ["job-status", jobMutation.data],
		});
		jobMutation.mutate();
	};

	// Return useful data & functions to the component
	return {
		startJob: jobMutation.mutate, // To manually trigger job start if needed
		retry, // Retry button can call this to restart everything
		jobId: jobMutation.data, // Current jobId
		status: statusQuery.data, // Current job status
		isLoading: jobMutation.isPending || statusQuery.isLoading, // Loading states
		isCompleted: statusQuery.data === completeStatus, // Convenient flag for UI
		isError: jobMutation.isError || statusQuery.isError, // Any error states
	};
};
