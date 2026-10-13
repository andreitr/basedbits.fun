// Defaults to the mainnet Evil Odds contract on Base; set NEXT_PUBLIC_EVIL_ODDS_ADDRESS to point at another deployment
export const EVIL_ODDS_ADDRESS = (process.env.NEXT_PUBLIC_EVIL_ODDS_ADDRESS ??
  "0x73115f07326c3049891639b8b6d856aa34223c59") as `0x${string}`;
