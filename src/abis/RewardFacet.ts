export const rewardFacetAbi = [
  {
    type: "function",
    name: "acceptOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "batchMintBadge",
    inputs: [
      {
        name: "_badgeContract",
        type: "address",
        internalType: "address",
      },
      {
        name: "_to",
        type: "address",
        internalType: "address",
      },
      {
        name: "_quantity",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_activityId",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_activityType",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_data",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "mintBadge",
    inputs: [
      {
        name: "_badgeContract",
        type: "address",
        internalType: "address",
      },
      {
        name: "_to",
        type: "address",
        internalType: "address",
      },
      {
        name: "_activityId",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_activityType",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_data",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "mintERC20",
    inputs: [
      {
        name: "_token",
        type: "address",
        internalType: "address",
      },
      {
        name: "_to",
        type: "address",
        internalType: "address",
      },
      {
        name: "_amount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_id",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_activityType",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_uri",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "mintERC721",
    inputs: [
      {
        name: "_token",
        type: "address",
        internalType: "address",
      },
      {
        name: "_to",
        type: "address",
        internalType: "address",
      },
      {
        name: "_quantity",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_baseURI",
        type: "string",
        internalType: "string",
      },
      {
        name: "_id",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_activityType",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_uri",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "multicall",
    inputs: [
      {
        name: "data",
        type: "bytes[]",
        internalType: "bytes[]",
      },
    ],
    outputs: [
      {
        name: "results",
        type: "bytes[]",
        internalType: "bytes[]",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "nomineeOwner",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transferERC20",
    inputs: [
      {
        name: "_token",
        type: "address",
        internalType: "address",
      },
      {
        name: "_to",
        type: "address",
        internalType: "address",
      },
      {
        name: "_amount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_id",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_activityType",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_uri",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferERC721",
    inputs: [
      {
        name: "_token",
        type: "address",
        internalType: "address",
      },
      {
        name: "_to",
        type: "address",
        internalType: "address",
      },
      {
        name: "_tokenId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_id",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_activityType",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_uri",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "BadgeMinted",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "quantity",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "to",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "activityId",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32",
      },
      {
        name: "activityType",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32",
      },
      {
        name: "data",
        type: "bytes",
        indexed: false,
        internalType: "bytes",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "BadgeMinted",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "quantity",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "to",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "id",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32",
      },
      {
        name: "activityType",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32",
      },
      {
        name: "uri",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "BadgeTransferred",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "to",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "tokenId",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "id",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32",
      },
      {
        name: "activityType",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32",
      },
      {
        name: "uri",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ERC721Minted",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "quantity",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "to",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "id",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32",
      },
      {
        name: "activityType",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32",
      },
      {
        name: "uri",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TokenMinted",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "to",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "id",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32",
      },
      {
        name: "activityType",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32",
      },
      {
        name: "uri",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TokenTransferred",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "to",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "id",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32",
      },
      {
        name: "activityType",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32",
      },
      {
        name: "uri",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "Ownable__NotOwner",
    inputs: [],
  },
  {
    type: "error",
    name: "Ownable__NotTransitiveOwner",
    inputs: [],
  },
  {
    type: "error",
    name: "RewardsFacet_InsufficientBalance",
    inputs: [],
  },
  {
    type: "error",
    name: "RewardsFacet_NotAuthorized",
    inputs: [],
  },
  {
    type: "error",
    name: "SafeOwnable__NotNomineeOwner",
    inputs: [],
  },
] as const;
