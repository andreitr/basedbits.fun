export const BBitsBurnerAbi = [
  {
    inputs: [
      { internalType: "address", name: "_owner", type: "address" },
      {
        internalType: "contract IERC20",
        name: "_WETH",
        type: "address",
      },
      { internalType: "contract IERC20", name: "_BBITS", type: "address" },
      {
        internalType: "contract IV2Router",
        name: "_uniV2Router",
        type: "address",
      },
      {
        internalType: "contract IV3Router",
        name: "_uniV3Router",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { inputs: [], name: "BuyZero", type: "error" },
  {
    inputs: [],
    name: "InValidPoolParams",
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
    name: "WETHDepositFailed",
    type: "error",
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
    inputs: [],
    name: "BBITS",
    outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "WETH",
    outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_minAmountBurned", type: "uint256" },
    ],
    name: "burn",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "dead",
    outputs: [{ internalType: "address", name: "", type: "address" }],
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
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "uint8", name: "pool", type: "uint8" },
          {
            internalType: "uint24",
            name: "fee",
            type: "uint24",
          },
        ],
        internalType: "struct IBBitsBurner.SwapParams",
        name: "_newSwapParams",
        type: "tuple",
      },
    ],
    name: "setSwapParams",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "swapParams",
    outputs: [
      { internalType: "uint8", name: "pool", type: "uint8" },
      {
        internalType: "uint24",
        name: "fee",
        type: "uint24",
      },
    ],
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
  {
    inputs: [],
    name: "uniV2Router",
    outputs: [
      { internalType: "contract IV2Router", name: "", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "uniV3Router",
    outputs: [
      { internalType: "contract IV3Router", name: "", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  { stateMutability: "payable", type: "receive" },
];
