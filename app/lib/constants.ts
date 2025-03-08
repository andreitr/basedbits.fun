export enum ALCHEMY_API_PATH {
  MAINNET = "base-mainnet",
}

export enum BASE_RACE_QKS {
  COUNT = "raceCount",
  RACE = "getRace",
  RACE_ENTRIES = "getRaceEntries",
  LAP = "getLap",
  MINT_FEE = "mintFee",
  MINT_TIME = "mintingTime",
  IS_BOOSTED = "isBoosted",
  LAP_TIME = "lapTime",
}

export const BASE_RACE_STATUS = {
  PENDING: 0,
  MINTING: 1,
  RACING: 2,
} as const;
