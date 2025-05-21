type Profile = {
  user_id: string;
  xp_balance: string;
  collected_badges: Badge[];
  completed_actions: Action[];
};

type Action = {
  id: string;
  name: string;
  createdAt: string;
  xp_rewarded: string;
};

interface Badge {
  id: string;
  name: string;
  metadataURI: string;
}

interface BadgeWithCollectedStatus extends Badge {
  isCollected: boolean;
  tokenId: string | null;
}

interface LeaderboardEntry {
  user: string;
  xp_rewarded: string;
  positionChange?: number | "new" | null;
  handle?: string;
  type?: "discord" | "telegram" | "github" | "unknown";
}

// @TODO: Clean up types above

type Mission = {
  id: string;
  name: string;
  user: {
    id: string;
  };
  tokens: {
    amount_rewarded: string;
    token: {
      name: string;
    };
  }[];
};

type Community = {
  id: Address;
  name: string;
  missions: Mission[];
  platformConnections: {
    platformId: string;
    platformType: string;
  }[];
  onchainData: {
    id: Address;
    name: string;
    badges: Badge[];
    tokens: Token[];
    owner: {
      id: Address;
    };
  };
  communityContractAddress: Address;
  communityContractChainId: Chain;
  description: string;
  title: string;
  accentColor: string;
  tokenLabel: string;
  userLabel: string;
  participantLabel: string;
  slug: string;
  bannerUrl: string;
  tokenToDisplay: `0x${string}`;
  showSocialHandles: boolean;
  darkMode: boolean;
  tiers: Tier[];
  rewards?: Reward[] | null;
  hiddenTokens: Address[];
};

type Token = {
  id: Address;
  token: {
    id: string;
    name: string;
    symbol: string;
    totalSupply: string;
    tokenType: string;
    createdAt: string;
  };
};

type UserProfile = {
  tokenBalances: TokenBalance[];
  collectedBadges: Badge[];
};

type TokenBalance = {
  balance: string;
  token: { app: { id: string } };
};

type Reward = {
  id: string;
  transactionHash: string;
  metadataURI: string;
  rewardId: string;
  rewardType: string;
  token: {
    id: string;
    name: string;
    symbol: string;
    decimals: number;
  };
  tokenAmount: string;
  badge: {
    id?: string;
    name: string;
    metadataURI: string;
  };
  badgeTokens: {
    tokenId: string;
  }[];
  user?: {
    id: string;
  };
  createdAt: string;
};

interface Tier {
  id: string;
  name: string;
  points_required: number;
  color: string;
  created_at: Date;
  updated_at: Date;
  community_id: string;
}

type Theme = {
  backgroundColor: string;
  color: string;
  borderColor: string;
  buttonColor: string;
};

type CurrentUser = {
  id: string;
  wallet_address: Address;
  apps: string[];
};

type BatchRewardEntry = {
  user: string;
  token: string;
  userAddress?: string | null | undefined;
  tokenAddress?: string | null | undefined;
  userAddress?: string | null | undefined;
  tokenAddress?: string | null | undefined;
  amount: number;
  actionType: string;
  rewardId: string;
};

type BatchRewardSettings = {
  header: boolean;
  header: boolean;
  delimiter: string | null | undefined;
  multicall: boolean;
};

type BatchRewardProgressInfo = {
  total: number;
  total: number;
  failed: number;
  success: number;
};

type BatchRewardEntryResult = {
  success: boolean;
  transactionHash: string | null | undefined;
  errorMessage: string | null | undefined;
  transactionHash: string | null | undefined;
  errorMessage: string | null | undefined;
  entry: BatchRewardEntry;
};

type RewardBadgeParams = {
  actionType: "mint-badge";
  communityAddress: string;
  badgeAddress: string;
  receiverAddress: string;
  rewardId: string;
  amount: number;
  metadata: string;
  activityType: string;
};

type RewardTokenMintParams = {
  actionType: "mint-token";
  communityAddress: string;
  tokenAddress: string;
  receiverAddress: string;
  rewardId: string;
  amount: number;
  metadata: string;
  activityType: string;
};

type RewardTokenTransferParams = {
  actionType: "transfer-token";
  communityAddress: string;
  tokenAddress: string;
  ownerAddress: string;
  receiverAddress: string;
  rewardId: string;
  amount: number;
  metadata: string;
  activityType: string;
};

type RewardListResponse = {
  [key: `rewards_${number}`]: Reward[];
};

interface DailyActivity {
  date: string;
  uniqueUsers: number;
  messageCount: number;
}

interface ChannelBreakdown {
  channelName: string;
  uniqueUsers: number;
  messageCount: number;
}

interface Overview {
  uniqueUsers: number;
  totalMessages: number;
  activeChannels: number;
}

interface KeyTopic {
  topic: string;
  evidence: string[];
  description: string;
  messageCount: number;
}

interface SentimentItem {
  title: string;
  users: string[];
  evidence: string[];
  description: string;
}

interface UserSentiment {
  excitement: SentimentItem[];
  frustrations: SentimentItem[];
}

interface TopContributor {
  username: string;
  messageCount: number;
}

interface ImpactReport {
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

interface ImpactReportsProps {
  communityId: string;
  agentId?: string;
}

type RewardUrlEvidence = {
  title: string;
  url: string;
};

type RewardEvidence = RewardUrlEvidence;

type RewardRecommendation = {
  id: string;
  communityId: string;
  contributor_name: string;
  wallet_address: string;
  platform: "discord" | "telegram" | "github" | "unknown";
  reward_id: string;
  points: number;
  metadata_uri: string;
  status: "pending" | "telegram" | "rejected" | "unknown";
  created_at: Date;
  updatedAt: Date;
  processedAt: string | null;
  error: string | null;
  impact: string;
  evidence: Array<RewardEvidence>;
};
