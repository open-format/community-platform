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

export interface KeyTopic {
  topic: string;
  evidence: string[];
  description: string;
  messageCount: number;
}

export interface TopContributor {
  username: string;
  messageCount: number;
}

export interface ChannelBreakdown {
  channel: string;
  messageCount: number;
  percentage: number;
}

export interface DailyActivity {
  date: string;
  messageCount: number;
}

export interface ImpactReport {
  id: string;
  communityId: string;
  communityName: string;
  period: {
    start: string;
    end: string;
  };
  totalMessages: number;
  activeUsers: number;
  keyTopics: KeyTopic[];
  topContributors: TopContributor[];
  channelBreakdown: ChannelBreakdown[];
  dailyActivity: DailyActivity[];
  userSentiment: UserSentiment;
  nextSteps: string[];
  createdAt: string;
}
