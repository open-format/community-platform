import { request } from 'graphql-request';
import { cache } from 'react';

interface MetricDataPoint {
  timestamp: string;
  count: number;
  totalCount: number;
}

interface AppRewardId {
  rewardId: string;
}

interface RewardIdStats {
  timestamp: string;
  totalCount: string;
}

interface RewardIdResponse {
  rewards: Array<{ id: string }>;
}

interface RewardStatsResponse {
  [key: string]: Array<{ timestamp: string; totalCount: string }>;
}

const METRICS_SUBGRAPH_URL = "https://api.studio.thegraph.com/query/82634/open-format-arbitrum-sepolia/version/latest";

export const fetchUniqueUsersMetrics = cache(async (
  appId: string, 
  startTime?: string, 
  endTime?: string
): Promise<MetricDataPoint[] | null> => {
  const query = `
    query UniqueUsers($appId: String!, $startTime: String, $endTime: String) {
      userRewardAppStats(
        interval: day
        where: {
          appId: $appId
          timestamp_gte: $startTime
          timestamp_lte: $endTime
        }
      ) {
        timestamp
        totalCount
        count
      }
    }
  `;

  try {
    const data = await request<{ userRewardAppStats: MetricDataPoint[] }>(
      METRICS_SUBGRAPH_URL,
      query,
      {
        appId,
        startTime,
        endTime
      }
    );
    return data.userRewardAppStats;
  } catch (error) {
    console.error('Error fetching unique users metrics:', error);
    return null;
  }
});

export const fetchTotalRewardsMetrics = cache(async (
  appId: string, 
  startTime?: string, 
  endTime?: string
): Promise<MetricDataPoint[] | null> => {
  const query = `
    query TotalRewards($appId: String!, $startTime: String, $endTime: String) {
      rewardAppStats(
        interval: hour
        where: {
          appId: $appId
          timestamp_gte: $startTime
          timestamp_lte: $endTime
        }
        orderBy: timestamp
        orderDirection: asc
      ) {
        timestamp
        count
        totalCount
      }
    }
  `;

  try {
    const data = await request<{ rewardAppStats: MetricDataPoint[] }>(
      METRICS_SUBGRAPH_URL,
      query,
      {
        appId,
        startTime,
        endTime
      }
    );
    return data.rewardAppStats;
  } catch (error) {
    console.error('Error fetching total rewards metrics:', error);
    return null;
  }
});

export const fetchRewardDistributionMetrics = cache(
  async (appId: string): Promise<Record<string, RewardIdStats[]> | null> => {
    const rewardIdsQuery = `
      query RewardDistribution($appId: String!) {
        appRewardIds(where: {app: $appId}) {
          rewardId
        }
      }
    `;

    try {
      const idsData = await request<{
        appRewardIds: { rewardId: string }[];
      }>(METRICS_SUBGRAPH_URL, rewardIdsQuery, { appId });

      if (!idsData.appRewardIds.length) {
        return null;
      }

      let combinedQuery = `
        query CombinedRewardStats($appId: String!) {
      `;

      idsData.appRewardIds.forEach((item, index) => {
        const safeRewardId = `reward_${index}`;
        combinedQuery += `
          ${safeRewardId}: rewardAppRewardIdStats(
            interval: day
            first: 1
            where: {appId: $appId, rewardId: "${item.rewardId}"}
          ) {
            timestamp
            totalCount
            rewardId
          }
        `;
      });

      combinedQuery += `
        }
      `;

      const combinedData = await request<Record<string, Array<{
        timestamp: string;
        totalCount: string;
        rewardId: string;
      }>>>(METRICS_SUBGRAPH_URL, combinedQuery, { appId });

      const finalStatsMap: Record<string, RewardIdStats[]> = {};

      idsData.appRewardIds.forEach((item, index) => {
        const alias = `reward_${index}`;
        const stats = combinedData[alias];

        if (stats && stats.length > 0) {
          finalStatsMap[item.rewardId] = stats.map((stat: any) => ({
            timestamp: stat.timestamp,
            totalCount: stat.totalCount.toString(),
          }));
        }
      });

      return finalStatsMap;
    } catch (error) {
      console.error("Error fetching reward distribution metrics:", error);
      return null;
    }
  },
);
