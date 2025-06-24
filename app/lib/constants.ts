import { DBCheckin, DBUser } from "@/app/lib/types/types";

export enum ALCHEMY_API_PATH {
  MAINNET = "base-mainnet",
}

export enum CHECKIN_QKS {
  CHECKINS = "checkins",
}

export enum USER_QKS {
  USER = "user",
}

export enum AEYE_QKS {
  REWARDS = "communityRewards",
  USER_REWARDS = "userRewards",
  MINTS = "mintsPerToken",
  TOTAL_MINTS = "totalMints",
  STREAK = "mintingStreak",
}

export enum POTRAIDER_QKS {
  MINTS = "mintsPerToken",
  TOTAL_MINTS = "totalMints",
  STREAK = "mintingStreak",
}

export const emptyDBUser: DBUser = {
  id: 0,
  created_at: "",
  updated_at: "",
  address: "",
  ens_name: null,
  ens_avatar: null,
  farcaster_name: null,
  farcaster_avatar: null,
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
  block_timestamp: 0,
};
