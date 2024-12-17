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
};

type Token = {
  id: Address;
  token: {
    name: string;
    symbol: string;
    totalSupply: string;
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
  createdAt: string;
};
