// Defaults to the mainnet Evil Odds contract on Base; set NEXT_PUBLIC_EVIL_ODDS_ADDRESS to point at another deployment
export const EVIL_ODDS_ADDRESS = (process.env.NEXT_PUBLIC_EVIL_ODDS_ADDRESS ??
  "0x73115f07326c3049891639b8b6d856aa34223c59") as `0x${string}`;

// Mint opens Oct 13 2026, 11:05 AM PT (unix seconds). The contract has no start time onchain; it deploys paused and the owner unpauses
export const EVIL_ODDS_MINT_START = 1791914700;
