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
  metadata: {
    [key: string]: string;
  };
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
