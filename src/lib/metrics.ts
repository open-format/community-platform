import { request } from 'graphql-request';
import { cache } from 'react';
import { getChainFromCommunityOrCookie } from '@/lib/openformat';

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
        interval: day
        where: {
          appId: $appId
          timestamp_gte: $startTime
          timestamp_lte: $endTime
        }
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
  const rewardIdsQuery = `
    query AppRewardIds($appId: String!) {
      appRewardIds(where: { app: $appId }) {
        rewardId
      }
    }
  `;

  try {
    const rewardIdsData = await request<{ appRewardIds: AppRewardId[] }>(
      METRICS_SUBGRAPH_URL,
      rewardIdsQuery,
      { appId }
    );

    if (!rewardIdsData.appRewardIds.length) {
      return null;
    }

    const statsQuery = `
      query RewardDistribution($appId: String!) {
        ${rewardIdsData.appRewardIds.map(({ rewardId }) => `
          ${rewardId.replace(/[^a-zA-Z0-9_]/g, '_')}: rewardAppRewardIdStats(
            interval: day
            first: 1
            where: {
              appId: $appId
              rewardId: "${rewardId}"
            }
          ) {
            timestamp
            totalCount
          }
        `).join('\n')}
      }
    `;

    const statsData = await request(
      METRICS_SUBGRAPH_URL,
      statsQuery,
      { appId }
    );

    return statsData;
  } catch (error) {
    console.error('Error fetching reward distribution metrics:', error);
    return null;
  }
});
