export const erc20FactoryAbi = [
  {
    inputs: [],
    name: "ERC20Factory_doNotHavePermission",
    type: "error",
  },
  {
    inputs: [],
    name: "ERC20Factory_failedToInitialize",
    type: "error",
  },
  {
    inputs: [],
    name: "ERC20Factory_noImplementationFound",
    type: "error",
  },
  {
    inputs: [],
    name: "Factory__FailedDeployment",
    type: "error",
  },
  {
    inputs: [],
    name: "ReentrancyGuard__ReentrantCall",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "id",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "creator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "symbol",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "decimals",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "supply",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "implementationId",
        type: "bytes32",
      },
    ],
    name: "Created",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_implementationId",
        type: "bytes32",
      },
    ],
    name: "calculateERC20FactoryDeploymentAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_symbol",
        type: "string",
      },
      {
        internalType: "uint8",
        name: "_decimals",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "_supply",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "_implementationId",
        type: "bytes32",
      },
    ],
    name: "createERC20",
    outputs: [
      {
        internalType: "address",
        name: "id",
        type: "address",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_implementationId",
        type: "bytes32",
      },
    ],
    name: "getERC20FactoryImplementation",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
