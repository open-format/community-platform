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
    console.log('Fetching unique users with:', { appId, startTime, endTime }); // Debug log
    const data = await request<{ userRewardAppStats: MetricDataPoint[] }>(
      METRICS_SUBGRAPH_URL,
      query,
      {
        appId,
        startTime,
        endTime
      }
    );
    console.log('Unique users response:', data.userRewardAppStats); // Debug log
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
    console.log('Fetching total rewards with:', { appId, startTime, endTime }); // Debug log
    const data = await request<{ rewardAppStats: MetricDataPoint[] }>(
      METRICS_SUBGRAPH_URL,
      query,
      {
        appId,
        startTime,
        endTime
      }
    );
    console.log('Total rewards response:', data); // Debug log
    return data.rewardAppStats;
  } catch (error) {
    console.error('Error fetching total rewards metrics:', error);
    return null;
  }
});

export const fetchRewardDistributionMetrics = cache(async (
  appId: string
): Promise<Record<string, RewardIdStats[]> | null> => {
  const query = `
    query RewardDistribution($appId: String!) {
      rewards(where: { app: $appId }, orderBy: createdAt, orderDirection: desc) {
        rewardId
        createdAt
      }
    }
  `;

  try {
    console.log('Fetching reward distribution for appId:', appId);
    const data = await request<{
      rewards: { rewardId: string; createdAt: string }[];
    }>(METRICS_SUBGRAPH_URL, query, { appId });

    console.log('Raw rewards data:', data.rewards);

    if (!data.rewards.length) {
      console.log('No rewards found');
      return null;
    }

    // Count occurrences of each rewardId
    const rewardCounts = data.rewards.reduce((acc, reward) => {
      if (!acc[reward.rewardId]) {
        acc[reward.rewardId] = {
          count: 0,
          createdAt: parseInt(reward.createdAt)
        };
      }
      acc[reward.rewardId].count++;
      return acc;
    }, {} as Record<string, { count: number; createdAt: number }>);

    console.log('Reward counts:', rewardCounts);

    // Convert to the expected format
    const finalStatsMap: Record<string, RewardIdStats[]> = {};
    Object.entries(rewardCounts).forEach(([rewardId, { count, createdAt }]) => {
      finalStatsMap[rewardId] = [{
        timestamp: createdAt.toString(),
        totalCount: count.toString()
      }];
    });

    console.log('Final stats map:', finalStatsMap);
    return finalStatsMap;
  } catch (error) {
    console.error('Error fetching reward distribution metrics:', error);
    return null;
  }
});
