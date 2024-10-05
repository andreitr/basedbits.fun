export const BBitsSocialRewardsAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
      { internalType: "contract IERC20", name: "_BBITS", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { inputs: [], name: "AmountZero", type: "error" },
  {
    inputs: [],
    name: "EnforcedPause",
    type: "error",
  },
  { inputs: [], name: "ExpectedPause", type: "error" },
  {
    inputs: [],
    name: "IndexOutOfBounds",
    type: "error",
  },
  { inputs: [], name: "InsufficientRewards", type: "error" },
  {
    inputs: [],
    name: "InvalidPercentage",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  { inputs: [], name: "ReentrancyGuardReentrantCall", type: "error" },
  {
    inputs: [],
    name: "RoundActive",
    type: "error",
  },
  { inputs: [], name: "RoundExpired", type: "error" },
  {
    inputs: [],
    name: "WrongStatus",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "_roundId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_numberOfEntries",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_userReward",
        type: "uint256",
      },
    ],
    name: "End",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "_roundId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "_entryId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "_user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "_link",
        type: "string",
      },
    ],
    name: "NewEntry",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "_roundId",
        type: "uint256",
      },
    ],
    name: "Start",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Unpaused",
    type: "event",
  },
  {
    inputs: [],
    name: "BBITS",
    outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256[]", name: "_entryIds", type: "uint256[]" },
    ],
    name: "approvePosts",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "count",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_amount", type: "uint256" }],
    name: "depositBBITS",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "duration",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_round", type: "uint256" },
      {
        internalType: "uint256",
        name: "_entryId",
        type: "uint256",
      },
    ],
    name: "getEntryInfoForId",
    outputs: [
      {
        components: [
          { internalType: "bool", name: "approved", type: "bool" },
          {
            internalType: "string",
            name: "post",
            type: "string",
          },
          { internalType: "address", name: "user", type: "address" },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
          },
        ],
        internalType: "struct IBBitsSocialRewards.Entry",
        name: "entry",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "rewardPercentage",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "round",
    outputs: [
      { internalType: "uint256", name: "startedAt", type: "uint256" },
      {
        internalType: "uint256",
        name: "settledAt",
        type: "uint256",
      },
      { internalType: "uint256", name: "userReward", type: "uint256" },
      {
        internalType: "uint256",
        name: "adminReward",
        type: "uint256",
      },
      { internalType: "uint256", name: "entriesCount", type: "uint256" },
      {
        internalType: "uint256",
        name: "rewardedCount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_newDuration", type: "uint256" },
    ],
    name: "setDuration",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bool", name: "_setPaused", type: "bool" }],
    name: "setPaused",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_newRewardPercentage",
        type: "uint256",
      },
    ],
    name: "setRewardPercentage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_newTotalRewardsPerRound",
        type: "uint256",
      },
    ],
    name: "setTotalRewardsPerRound",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "settleCurrentRound",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "startNextRound",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "status",
    outputs: [
      {
        internalType: "enum IBBitsSocialRewards.RewardsStatus",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "_link", type: "string" }],
    name: "submitPost",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "totalRewardsPerRound",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];