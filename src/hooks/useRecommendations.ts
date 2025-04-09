import { useConfetti } from "@/contexts/confetti-context";
import { useEffect, useState } from "react";
import {
  getRewardRecommendations,
  rejectRewardRecommendation,
  editRewardRecommendation,
  acceptRewardRecommendation
} from "@/lib/openformat";

const mockData: RewardRecommendation[] = [
  {
    id: "1a2b3c4d-5678-90ab-cdef-1234567890ab",
    communityId: "community_xyz",
    contributorName: "Jane Doe",
    walletAddress: "0x123abc456def789ghi012jkl345mno678pqr",
    platform: "discord",
    rewardId: "reward_001",
    points: 150,
    metadataUri: "ipfs://metadatauri123",
    status: "pending",
    createdAt: new Date( "2025-03-27T12:34:56Z" ),
    updatedAt: new Date( "2025-03-27T12:34:56Z" ),
    processedAt: null,
    error: null,
    evidence: [
      {
        title: "GitHub PR #123",
        url: "https://github.com/open-format/community-platform/pull/123",
      },
      {
        title: "Discord Discussion",
        url: "https://discord.com/channels/123456789/987654321",
      },
    ],
    impact: "",
  },
  {
    id: "9f8e7d6c-5432-10ba-fedc-9987654321ba",
    communityId: "community_abc",
    contributorName: "Pepe Vega",
    walletAddress: "0xabc987def654ghi321jkl012mno345pqr678",
    platform: "telegram",
    rewardId: "reward_002",
    points: 55,
    metadataUri: "ipfs://metadatauri456",
    status: "pending",
    createdAt: new Date( "2025-03-26T09:21:00Z" ),
    updatedAt: new Date( "2025-03-26T09:21:00Z" ),
    processedAt: null,
    error: null,
    evidence: [
      {
        title: "GitHub PR #123",
        url: "https://github.com/open-format/community-platform/pull/123",
      },
      {
        title: "Discord Discussion",
        url: "https://discord.com/channels/123456789/987654321",
      },
    ],
    impact: "",
  },
  {
    id: "9f8e7d6c-5432-10ba-fedc-0987654321ba",
    communityId: "community_abc",
    contributorName: "John Smith",
    walletAddress: "0xabc987def654ghi321jkl012mno345pqr678",
    platform: "telegram",
    rewardId: "reward_002",
    points: 75,
    metadataUri: "ipfs://metadatauri456",
    status: "pending",
    createdAt: new Date( "2025-03-26T09:21:00Z" ),
    updatedAt: new Date( "2025-03-26T09:21:00Z" ),
    processedAt: null,
    error: null,
    evidence: [
      {
        title: "GitHub PR #123",
        url: "https://github.com/open-format/community-platform/pull/123",
      },
      {
        title: "Discord Discussion",
        url: "https://discord.com/channels/123456789/987654321",
      },
    ],
    impact: "",
  },
  {
    id: "9f8e7d6c-5932-10ba-fedc-0987654321ba",
    communityId: "community_abc",
    contributorName: "Peter Pan",
    walletAddress: "0xabc987def654ghi321jkl012mno345pqr678",
    platform: "telegram",
    rewardId: "reward_002",
    points: 175,
    metadataUri: "ipfs://metadatauri456",
    status: "pending",
    createdAt: new Date( "2025-03-26T09:21:00Z" ),
    updatedAt: new Date( "2025-03-26T09:21:00Z" ),
    processedAt: null,
    error: null,
    evidence: [
      {
        title: "GitHub PR #123",
        url: "https://github.com/open-format/community-platform/pull/123",
      },
      {
        title: "Discord Discussion",
        url: "https://discord.com/channels/123456789/987654321",
      },
    ],
    impact: "",
  },
];

export const useRecommendations = () => {
  const {triggerConfetti} = useConfetti();

  const [isConfirming, setIsConfirming] = useState( false );
  const [isRejecting, setIsRejecting] = useState( false );
  const [recommendations, setRecommendations] =
    useState<RewardRecommendation[]>( mockData );

  const rejectRecommendation = async (rewardRecommendation: RewardRecommendation | null) => {
    setIsRejecting( true );
    return new Promise( async (resolve, reject) => {
      try {
        if (rewardRecommendation?.id) {
          const response = await rejectRewardRecommendation( rewardRecommendation.id );

          if (response) {
            resolve( true );
          } else {
            resolve( false );
          }
        }
      } catch (e) {
        reject( e );
      }
    } ).catch( err => {
      console.log( err );
      return false;
    } ).finally( () => setIsRejecting( false ) );
  };

  const confirmRecommendation = async () => {
    setIsConfirming( true );
    // Simulate a POST request with a 3-second delay
    return new Promise<void>( (resolve) => {
      console.log( "Simulating POST request for reward confirmation..." );

      setTimeout( () => {
        console.log( "POST request completed successfully" );
        triggerConfetti();
        resolve();
      }, 3000 );
    } ).finally( () => {
      setIsConfirming( false );
    } );
  };

  useEffect( () => {
    // TODO: uncomment load recommendations from API
    // startTransition( async () => {
    //   try {
    //     const data = await getRewardRecommendations();
    //     setRecommendations( data );
    //   } catch (e) {
    //     console.log(e);
    //   }
    // } );
  }, [] );

  return {
    recommendations,
    rejectRecommendation,
    confirmRecommendation,
    isConfirming,
    isRejecting,
  };
};
