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

type Badge = {
  id: string;
  name: string;
  metadataURI: string;
};

interface LeaderboardEntry {
  user: string;
  xp_rewarded: string;
  positionChange?: number | "new" | null;
}

type JourneyItem = {
  id: number;
  action: string;
  date: number;
};

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
