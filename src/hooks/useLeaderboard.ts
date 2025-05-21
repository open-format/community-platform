import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useLeaderboard(
  community: Community,
  tokenId: string,
  startDate: string,
  endDate: string,
) {
  return useQuery({
    queryKey: ["leaderboard", community.id, tokenId, startDate, endDate],
    queryFn: async () => {
      const { data } = await axios.get("/api/leaderboard", {
        params: {
          communityId: community.id,
          tokenId,
          startDate,
          endDate,
        },
      });

      return data;
    },
    enabled: !!tokenId && !!startDate && !!endDate,
  });
}
