export const LEADERBOARD_DATA: LeaderboardEntry[] = [
  { user: "0x03755352654d73da06756077dd7f040adce3fd58", xp_rewarded: "310" },
  { user: "0x16bb52a951e3dd1d2cdb95b1a70c2b05ce1e4cee", xp_rewarded: "110" },
  { user: "0xb98492ec79fcc78cb584eafacee18d9a4cdc3424", xp_rewarded: "60" },
  { user: "0x7d92949b4dace9aee85ecd7d362b3a8ffc40e00a", xp_rewarded: "30" },
];

export const CURRENT_WALLET = "0xb98492ec79fcc78cb584eafacee18d9a4cdc3424";

// Helper to get random recent timestamps
const now = Math.floor(Date.now() / 1000);
const minutesAgo = (minutes: number) => now - minutes * 60;

// Dummy data
export const PROFILE: Profile = {
  user_id: "0x123445678",
  xp_balance: "100",
  collected_badges: [
    {
      id: "123",
      name: "Badge 1",
      metadataURI: "https://placehold.co/400",
      metadata: {
        image: "https://placehold.co/400",
        description: "Badge 1 description",
      },
    },
    {
      id: "124",
      name: "Badge 2",
      metadataURI: "https://placehold.co/400",
      metadata: {
        image: "https://placehold.co/400",
        description: "Badge 2 description",
      },
    },
    {
      id: "125",
      name: "Badge 3",
      metadataURI: "https://placehold.co/400",
      metadata: {
        image: "https://placehold.co/400",
        description: "Badge 3 description",
      },
    },
  ],
  completed_actions: [
    {
      id: "123",
      name: "Action 1",
      xp_rewarded: "100",
      createdAt: minutesAgo(1),
    },
  ],
};

export const JOURNEY_ITEMS: JourneyItem[] = [
  { id: 1, action: "Shared a tutorial on Youtube", date: minutesAgo(2) },
  {
    id: 2,
    action: "Helped someone in Discord",
    date: minutesAgo(15),
  },
  { id: 3, action: "Made a pull request on Github", date: minutesAgo(45) },
  { id: 4, action: "Joined the community", date: minutesAgo(120) },
  { id: 5, action: "Published a blog post", date: minutesAgo(360) },
  { id: 6, action: "Earned a new badge", date: minutesAgo(1440) },
  {
    id: 7,
    action: "Contributed to an open-source project",
    date: minutesAgo(2880),
  },
];
