// Defaults to the mainnet Evil Odds contract on Base; set NEXT_PUBLIC_EVIL_ODDS_ADDRESS to point at another deployment
export const EVIL_ODDS_ADDRESS = (process.env.NEXT_PUBLIC_EVIL_ODDS_ADDRESS ??
  "0xaf38c413d729e8ebdf29fc4d20f2fc91b306ebf0") as `0x${string}`;
