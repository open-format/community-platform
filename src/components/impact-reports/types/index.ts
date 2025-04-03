export interface DailyActivity {
  date: string;
  uniqueUsers: number;
  messageCount: number;
}

export interface ChannelBreakdown {
  channelName: string;
  uniqueUsers: number;
  messageCount: number;
}

export interface Overview {
  uniqueUsers: number;
  totalMessages: number;
  activeChannels: number;
}

export interface KeyTopic {
  topic: string;
  evidence: string[];
  description: string;
  messageCount: number;
}

export interface SentimentItem {
  title: string;
  users: string[];
  evidence: string[];
  description: string;
}

export interface UserSentiment {
  excitement: SentimentItem[];
  frustrations: SentimentItem[];
}

export interface TopContributor {
  username: string;
  messageCount: number;
}

export interface ImpactReport {
  endDate: number;
  overview: Overview;
  keyTopics: KeyTopic[];
  startDate: number;
  summaryId: string;
  timestamp: number;
  platformId: string;
  messageCount: number;
  dailyActivity: DailyActivity[];
  userSentiment: UserSentiment;
  topContributors: TopContributor[];
  uniqueUserCount: number;
  channelBreakdown: ChannelBreakdown[];
}

export interface ImpactReportsProps {
  communityId: string;
  agentId?: string;
} 