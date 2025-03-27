import { DBCheckin, DBUser } from "@/app/lib/types/types";

export enum ALCHEMY_API_PATH {
  MAINNET = "base-mainnet",
}

export enum CHECKIN_QKS {
  CHECKINS = "checkins",
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

export const emptyDBUser: DBUser = {
  user_id: 0,
  created_at: "",
  updated_at: "",
  address: "",
  ens_name: null,
  ens_avatar: null,
  farcaster_name: null,
  farcaster_avatar: null
};

export const emptyDBCheckin: DBCheckin = {
  id: 0,
  user_id: 0,
  created_at: "",
  updated_at: "",
  streak: 0,
  count: 0,
  hash: "",
  block_number: 0,
  block_timestamp: 0
};
