import { request } from "graphql-request";
import { cache } from "react";
import { getChainFromCommunityOrCookie } from "./openformat";

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

export const fetchUniqueUsersMetrics = cache(
  async (
    appId: string,
    startTime?: string,
    endTime?: string,
  ): Promise<MetricDataPoint[] | null> => {
    const chain = await getChainFromCommunityOrCookie(appId);
    if (!chain) return null;

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
        chain.SUBGRAPH_URL,
        query,
        {
          appId,
          startTime,
          endTime,
        },
      );
      return data.userRewardAppStats;
    } catch (error) {
      console.error("Error fetching unique users metrics:", error);
      return null;
    }
  },
);

export const fetchTotalRewardsMetrics = cache(
  async (
    appId: string,
    startTime?: string,
    endTime?: string,
  ): Promise<MetricDataPoint[] | null> => {
    const chain = await getChainFromCommunityOrCookie(appId);
    if (!chain) return null;

    // @TODO: Add pagination to get all data

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
        first: 1000
      ) {
        timestamp
        count
        totalCount
      }
    }
  `;

    try {
      const data = await request<{ rewardAppStats: MetricDataPoint[] }>(chain.SUBGRAPH_URL, query, {
        appId,
        startTime,
        endTime,
      });
      return data.rewardAppStats;
    } catch (error) {
      console.error("Error fetching total rewards metrics:", error);
      return null;
    }
  },
);

export const fetchRewardDistributionMetrics = cache(
  async (appId: string): Promise<Record<string, RewardIdStats[]> | null> => {
    const chain = await getChainFromCommunityOrCookie(appId);
    if (!chain) return null;

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
      }>(chain.SUBGRAPH_URL, rewardIdsQuery, { appId });

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

      const combinedData = await request<
        Record<
          string,
          Array<{
            timestamp: string;
            totalCount: string;
            rewardId: string;
          }>
        >
      >(chain.SUBGRAPH_URL, combinedQuery, { appId });

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

// Test data generator for development
export const fetchTotalRewardsMetricsTest = cache(
  async (
    appId: string,
    startTime?: string,
    endTime?: string,
  ): Promise<MetricDataPoint[] | null> => {
    const start = startTime ? Number.parseInt(startTime) / 1000000 : 0;
    const end = endTime ? Number.parseInt(endTime) / 1000000 : Date.now() / 1000;

    const dataPoints: MetricDataPoint[] = [];
    let currentTime = Math.floor(start / 86400) * 86400; // Align to start of day
    let totalCount = 0;

    while (currentTime <= end) {
      const hour = new Date(currentTime * 1000).getHours();
      const dayOfWeek = new Date(currentTime * 1000).getDay();

      let baseCount = 0;
      if (hour >= 9 && hour <= 17) {
        baseCount = 15;
      } else if (hour >= 18 && hour <= 22) {
        baseCount = 25;
      } else {
        baseCount = 5;
      }

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        baseCount = Math.floor(baseCount * 0.7);
      }

      const randomFactor = 0.8 + Math.random() * 0.4;
      const count = Math.floor(baseCount * randomFactor);

      totalCount += count;

      dataPoints.push({
        timestamp: (currentTime * 1000000).toString(),
        count: count,
        totalCount: totalCount,
      });

      currentTime += 3600;
    }

    return dataPoints;
  },
);

// Test data generator for unique users
export const fetchUniqueUsersMetricsTest = cache(
  async (
    appId: string,
    startTime?: string,
    endTime?: string,
  ): Promise<MetricDataPoint[] | null> => {
    const start = startTime ? Number.parseInt(startTime) / 1000000 : 0;
    const end = endTime ? Number.parseInt(endTime) / 1000000 : Date.now() / 1000;

    const dataPoints: MetricDataPoint[] = [];
    let currentTime = Math.floor(start / 86400) * 86400;
    let totalCount = 0;

    while (currentTime <= end) {
      const date = new Date(currentTime * 1000);
      const dayOfWeek = date.getDay();

      let baseCount = 0;
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        // Weekdays
        baseCount = 50;
      } else {
        // Weekends
        baseCount = 30;
      }

      // Add random variation
      const randomFactor = 0.8 + Math.random() * 0.4;
      const count = Math.floor(baseCount * randomFactor);

      totalCount += count;

      dataPoints.push({
        timestamp: (currentTime * 1000000).toString(),
        count: count,
        totalCount: totalCount,
      });

      currentTime += 86400;
    }

    return dataPoints;
  },
);

const shouldUseTestData = process.env.NEXT_PUBLIC_USE_TEST_DATA === "true";

export const fetchTotalRewardsMetricsWrapped = cache(
  async (
    appId: string,
    startTime?: string,
    endTime?: string,
  ): Promise<MetricDataPoint[] | null> => {
    return shouldUseTestData
      ? fetchTotalRewardsMetricsTest(appId, startTime, endTime)
      : fetchTotalRewardsMetrics(appId, startTime, endTime);
  },
);

export const fetchUniqueUsersMetricsWrapped = cache(
  async (
    appId: string,
    startTime?: string,
    endTime?: string,
  ): Promise<MetricDataPoint[] | null> => {
    return shouldUseTestData
      ? fetchUniqueUsersMetricsTest(appId, startTime, endTime)
      : fetchUniqueUsersMetrics(appId, startTime, endTime);
  },
);
