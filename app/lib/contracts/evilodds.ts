// Defaults to the Test Ghouls contract on Base; set NEXT_PUBLIC_EVIL_ODDS_ADDRESS to point at another deployment
export const EVIL_ODDS_ADDRESS = (process.env.NEXT_PUBLIC_EVIL_ODDS_ADDRESS ??
  "0x091b43e113f80f00b8fb9840ca8a22b7277c59b8") as `0x${string}`;
