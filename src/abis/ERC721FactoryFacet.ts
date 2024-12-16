export const badgeFactoryAbi = [
  {
    type: "function",
    name: "calculateERC721FactoryDeploymentAddress",
    inputs: [
      {
        name: "_implementationId",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
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
    name: "createERC721",
    inputs: [
      {
        name: "_name",
        type: "string",
        internalType: "string",
      },
      {
        name: "_symbol",
        type: "string",
        internalType: "string",
      },
      {
        name: "_royaltyRecipient",
        type: "address",
        internalType: "address",
      },
      {
        name: "_royaltyBps",
        type: "uint16",
        internalType: "uint16",
      },
      {
        name: "_implementationId",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "id",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "createERC721WithTokenURI",
    inputs: [
      {
        name: "_name",
        type: "string",
        internalType: "string",
      },
      {
        name: "_symbol",
        type: "string",
        internalType: "string",
      },
      {
        name: "_tokenURI",
        type: "string",
        internalType: "string",
      },
      {
        name: "_royaltyRecipient",
        type: "address",
        internalType: "address",
      },
      {
        name: "_royaltyBps",
        type: "uint16",
        internalType: "uint16",
      },
      {
        name: "_implementationId",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "id",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "getERC721FactoryImplementation",
    inputs: [
      {
        name: "_implementationId",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
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
    name: "platformFeeInfo",
    inputs: [
      {
        name: "_price",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "recipient",
        type: "address",
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
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
    name: "Created",
    inputs: [
      {
        name: "id",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "creator",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "name",
        type: "string",
        indexed: false,
        internalType: "string",
      },
      {
        name: "symbol",
        type: "string",
        indexed: false,
        internalType: "string",
      },
      {
        name: "royaltyRecipient",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "royaltyBps",
        type: "uint16",
        indexed: false,
        internalType: "uint16",
      },
      {
        name: "implementationId",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "CreatorAccessUpdated",
    inputs: [
      {
        name: "accounts",
        type: "address[]",
        indexed: false,
        internalType: "address[]",
      },
      {
        name: "approvals",
        type: "bool[]",
        indexed: false,
        internalType: "bool[]",
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
    name: "PaidPlatformFee",
    inputs: [
      {
        name: "currency",
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
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "ApplicationAccess_AccountsAndApprovalsMustBeTheSameLength",
    inputs: [],
  },
  {
    type: "error",
    name: "ApplicationAccess_notAuthorised",
    inputs: [],
  },
  {
    type: "error",
    name: "CurrencyTransferLib_insufficientValue",
    inputs: [],
  },
  {
    type: "error",
    name: "CurrencyTransferLib_nativeTokenTransferFailed",
    inputs: [],
  },
  {
    type: "error",
    name: "ERC721Factory_doNotHavePermission",
    inputs: [],
  },
  {
    type: "error",
    name: "ERC721Factory_failedToInitialize",
    inputs: [],
  },
  {
    type: "error",
    name: "ERC721Factory_noImplementationFound",
    inputs: [],
  },
  {
    type: "error",
    name: "Factory__FailedDeployment",
    inputs: [],
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
    name: "ReentrancyGuard__ReentrantCall",
    inputs: [],
  },
] as const;
