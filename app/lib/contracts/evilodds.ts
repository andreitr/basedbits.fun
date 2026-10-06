// Defaults to the Test Evil Odds contract on Base; set NEXT_PUBLIC_EVIL_ODDS_ADDRESS to point at another deployment
export const EVIL_ODDS_ADDRESS = (process.env.NEXT_PUBLIC_EVIL_ODDS_ADDRESS ??
  "0xcf4b09add114a5821f6e0171a9b2a98b4fc4ea41") as `0x${string}`;
