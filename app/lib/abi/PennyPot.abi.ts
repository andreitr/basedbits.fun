// Minimal ABI for the PennyPot functions the check-in rewards cron calls.
// Hand-authored because the live deployment
// (0x133195CEd7Cf71A7ed3a428a30816d83f022C9A1) is unverified on the explorer.
// Source of truth: andreitr/pennypot. `buyTicketSharesFor` selector 0xf6e2e620.
export const PennyPotABI = [
  {
    type: "function",
    name: "getState",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "currentDrawingId", type: "uint256" },
      { name: "currentTicketId", type: "uint256" },
      { name: "sold", type: "uint8" },
      { name: "deadline", type: "uint64" },
      { name: "canBuyNextTicket", type: "bool" },
      { name: "reserve", type: "uint256" },
      { name: "isPaused", type: "bool" },
    ],
  },
  {
    type: "function",
    name: "buyTicketSharesFor",
    stateMutability: "nonpayable",
    inputs: [
      { name: "expectedTicketId", type: "uint256" },
      { name: "count", type: "uint8" },
      { name: "recipient", type: "address" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "buyTicket",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  // Custom errors — required so ethers v6 can decode reverts by name. The buy
  // loop relies on these names to detect a ticket that rolled/filled mid-run.
  {
    type: "error",
    name: "UnexpectedTicket",
    inputs: [
      { name: "active", type: "uint256" },
      { name: "expected", type: "uint256" },
    ],
  },
  { type: "error", name: "PastSellingWindow", inputs: [] },
  { type: "error", name: "NoActiveTicket", inputs: [] },
  { type: "error", name: "InvalidCount", inputs: [] },
] as const;
