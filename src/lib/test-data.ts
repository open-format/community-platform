import { ImpactReport, DailyActivity, ChannelBreakdown, TopContributor, KeyTopic, UserSentiment } from "@/components/impact-reports/types";

export const generateImpactReportTestData = (): ImpactReport => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30); // 30 days ago
  const endDate = new Date();

  const dailyActivity: DailyActivity[] = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    return {
      date: date.toISOString().split('T')[0],
      uniqueUsers: Math.floor(Math.random() * 20) + 5,
      messageCount: Math.floor(Math.random() * 100) + 20
    };
  });

  const channelBreakdown: ChannelBreakdown[] = [
    {
      channelName: "💬｜general-chat",
      uniqueUsers: 45,
      messageCount: 320
    },
    {
      channelName: "📢｜announcements",
      uniqueUsers: 38,
      messageCount: 150
    },
    {
      channelName: "🤝｜collaboration",
      uniqueUsers: 25,
      messageCount: 180
    },
    {
      channelName: "💡｜ideas",
      uniqueUsers: 20,
      messageCount: 95
    },
    {
      channelName: "🎮｜gaming",
      uniqueUsers: 18,
      messageCount: 120
    },
    {
      channelName: "🎨｜art",
      uniqueUsers: 15,
      messageCount: 85
    },
    {
      channelName: "📚｜resources",
      uniqueUsers: 22,
      messageCount: 110
    }
  ];

  const topContributors: TopContributor[] = [
    {
      username: "zubairaurorasupportteam",
      messageCount: 89
    },
    {
      username: "tech_enthusiast",
      messageCount: 76
    },
    {
      username: "blockchain_dev",
      messageCount: 65
    },
    {
      username: "community_manager",
      messageCount: 58
    },
    {
      username: "web3_innovator",
      messageCount: 45
    },
    {
      username: "crypto_artist",
      messageCount: 42
    },
    {
      username: "defi_expert",
      messageCount: 38
    },
    {
      username: "nft_collector",
      messageCount: 35
    },
    {
      username: "game_dev",
      messageCount: 32
    },
    {
      username: "content_creator",
      messageCount: 28
    },
    {
      username: "blockchain_researcher",
      messageCount: 25
    },
    {
      username: "smart_contract_dev",
      messageCount: 24
    },
    {
      username: "web3_designer",
      messageCount: 23
    },
    {
      username: "community_advocate",
      messageCount: 22
    },
    {
      username: "protocol_engineer",
      messageCount: 21
    },
    {
      username: "dao_contributor",
      messageCount: 20
    },
    {
      username: "nft_artist",
      messageCount: 19
    },
    {
      username: "defi_analyst",
      messageCount: 18
    },
    {
      username: "crypto_educator",
      messageCount: 17
    },
    {
      username: "web3_consultant",
      messageCount: 16
    }
  ];

  const keyTopics: KeyTopic[] = [
    {
      topic: "Blockchain Development Skills and Opportunities",
      evidence: [
        "https://discord.com/channels/856517297141317643/888806875347435590/1354252855292199073",
        "https://discord.com/channels/856517297141317643/888806875347435590/1352890775922544660"
      ],
      description: "Users are sharing their skills and experience as blockchain developers, particularly in Solidity and Rust, and expressing interest in new opportunities.",
      messageCount: 12
    },
    {
      topic: "Community Engagement and Events",
      evidence: [
        "https://discord.com/channels/856517297141317643/888806875347435590/1352249151068307498",
        "https://discord.com/channels/856517297141317643/888806875347435590/1352585173413400616"
      ],
      description: "Active discussions about upcoming community events, meetups, and collaborative projects.",
      messageCount: 15
    },
    {
      topic: "Technical Support and Troubleshooting",
      evidence: [
        "https://discord.com/channels/856517297141317643/888806875347435590/1354901926466293811"
      ],
      description: "Community members helping each other with technical issues and providing support.",
      messageCount: 8
    },
    {
      topic: "NFT and Digital Art Creation",
      evidence: [
        "https://discord.com/channels/856517297141317643/888806875347435590/1354901926466293812"
      ],
      description: "Discussions about NFT creation, digital art tools, and marketplace strategies.",
      messageCount: 10
    },
    {
      topic: "DeFi Protocols and Yield Farming",
      evidence: [
        "https://discord.com/channels/856517297141317643/888806875347435590/1354901926466293813"
      ],
      description: "Analysis of different DeFi protocols and strategies for yield farming.",
      messageCount: 9
    },
    {
      topic: "Gaming and Metaverse Development",
      evidence: [
        "https://discord.com/channels/856517297141317643/888806875347435590/1354901926466293814"
      ],
      description: "Discussions about blockchain gaming, metaverse development, and play-to-earn mechanics.",
      messageCount: 7
    },
    {
      topic: "Content Creation and Marketing",
      evidence: [
        "https://discord.com/channels/856517297141317643/888806875347435590/1354901926466293815"
      ],
      description: "Strategies for content creation, social media marketing, and community growth.",
      messageCount: 6
    },
    {
      topic: "Smart Contract Security",
      evidence: [
        "https://discord.com/channels/856517297141317643/888806875347435590/1354901926466293820"
      ],
      description: "Discussions about smart contract auditing, security best practices, and vulnerability prevention.",
      messageCount: 14
    },
    {
      topic: "Layer 2 Solutions",
      evidence: [
        "https://discord.com/channels/856517297141317643/888806875347435590/1354901926466293821"
      ],
      description: "Analysis of various Layer 2 scaling solutions and their implementation.",
      messageCount: 11
    },
    {
      topic: "DAO Governance",
      evidence: [
        "https://discord.com/channels/856517297141317643/888806875347435590/1354901926466293822"
      ],
      description: "Discussions about decentralized governance models and voting mechanisms.",
      messageCount: 13
    },
    {
      topic: "Cross-chain Interoperability",
      evidence: [
        "https://discord.com/channels/856517297141317643/888806875347435590/1354901926466293823"
      ],
      description: "Exploring solutions for cross-chain communication and asset transfers.",
      messageCount: 9
    },
    {
      topic: "Zero Knowledge Proofs",
      evidence: [
        "https://discord.com/channels/856517297141317643/888806875347435590/1354901926466293824"
      ],
      description: "Technical discussions about ZK-proofs and their applications.",
      messageCount: 8
    }
  ];

  const userSentiment: UserSentiment = {
    excitement: [
      {
        title: "Upcoming Product Launch",
        users: ["zubairaurorasupportteam", "tech_enthusiast", "blockchain_dev"],
        evidence: [
          "https://discord.com/channels/856517297141317643/888806875347435590/1352249151068307498",
          "https://discord.com/channels/856517297141317643/888806875347435590/1352585173413400616"
        ],
        description: "Community members are excited about the upcoming product launch and new features."
      },
      {
        title: "Community Growth",
        users: ["community_manager", "web3_innovator"],
        evidence: [
          "https://discord.com/channels/856517297141317643/888806875347435590/1354252855292199073"
        ],
        description: "Positive sentiment about the growing community and increasing engagement."
      },
      {
        title: "New Partnership Announcement",
        users: ["defi_expert", "nft_collector"],
        evidence: [
          "https://discord.com/channels/856517297141317643/888806875347435590/1354901926466293816"
        ],
        description: "Excitement about a new strategic partnership with a major blockchain project."
      },
      {
        title: "Successful Community Event",
        users: ["game_dev", "content_creator"],
        evidence: [
          "https://discord.com/channels/856517297141317643/888806875347435590/1354901926466293817"
        ],
        description: "Positive feedback about the recent community AMA and networking event."
      }
    ],
    frustrations: [
      {
        title: "Technical Issues",
        users: ["tech_enthusiast", "blockchain_dev"],
        evidence: [
          "https://discord.com/channels/856517297141317643/888806875347435590/1354901926466293811"
        ],
        description: "Some users experiencing technical difficulties with the platform."
      },
      {
        title: "Documentation Updates",
        users: ["crypto_artist", "defi_expert"],
        evidence: [
          "https://discord.com/channels/856517297141317643/888806875347435590/1354901926466293818"
        ],
        description: "Requests for more comprehensive documentation and tutorials."
      },
      {
        title: "Feature Requests",
        users: ["nft_collector", "game_dev"],
        evidence: [
          "https://discord.com/channels/856517297141317643/888806875347435590/1354901926466293819"
        ],
        description: "Users expressing need for additional features and improvements."
      },
      {
        title: "Integration Challenges",
        users: ["smart_contract_dev", "protocol_engineer"],
        evidence: [
          "https://discord.com/channels/856517297141317643/888806875347435590/1354901926466293825"
        ],
        description: "Developers facing challenges with third-party integrations and API compatibility."
      }
    ]
  };

  return {
    endDate: endDate.getTime(),
    overview: {
      uniqueUsers: 48,
      totalMessages: 745,
      activeChannels: 7
    },
    keyTopics,
    startDate: startDate.getTime(),
    summaryId: "52c330a1-2261-4191-888e-d26579dadc30",
    timestamp: endDate.getTime(),
    platformId: "856517297141317643",
    messageCount: 745,
    dailyActivity,
    userSentiment,
    topContributors,
    uniqueUserCount: 48,
    channelBreakdown
  };
}; 