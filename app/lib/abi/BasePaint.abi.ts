export const BasePaintAbi = [
  {
    inputs: [
      { internalType: "uint256", name: "day", type: "uint256" },
      { internalType: "uint256", name: "count", type: "uint256" },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "today",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
