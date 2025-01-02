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
  type?: "discord" | "telegram" | "unknown";
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
  owner: {
    id: Address;
  };
  tokens: Token[];
  missions: Mission[];
  badges: Badge[];
  metadata: {
    title: string;
    description: string;
    accent_color: string;
    token_label: string;
    user_label: string;
    participant_label: string;
    slug: string;
    banner_url: string;
    token_to_display: `0x${string}`;
    show_social_handles: boolean;
    dark_mode: boolean;
  };
  tiers: Tier[];
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
  };
  tokenAmount: string;
  badge: {
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
