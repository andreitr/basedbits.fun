import BigNumber from "bignumber.js";

export type RawMetadata = {
  id: number;
  image: string;
  name: string;
};

export type RaffleSponsor = {
  sponsor: `0x${string}`;
  tokenId: BigNumber;
};

export type SocialRewardsRoundEntry = {
  approved: boolean;
  post: string;
  user: `0x${string}`;
  timestamp: number;
};
export type SocialRewardsRound = {
  settledAt: number;
  startedAt: number;
  userReward: string;
  adminReward: string;
  entriesCount: number;
  rewardedCount: number;
};

export type Mint = {
  burned: string;
  mints: BigNumber;
  rewards: strings;
  settledAt: BigNumber;
  startedAt: BigNumber;
  tokenId: BigNumber;
  winner: `0x${string}`;
};

export type Raffle = {
  startedAt: BigNumber;
  settledAt: BigNumber;
  winner: `0x${string}`;
  sponsor: RaffleSponsor;
};

export type CheckIn = {
  lastCheckin: number;
  streak: number;
  count: number;
};

export interface CheckInEvent {
  sender: string;
  timestamp: number;
  streak: number;
  totalCheckIns: number;
  transactionHash: string;
  blockNumber: number;
  blockTimestamp: number;
}

export interface DBCheckin {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  streak: number;
  count: number;
  hash: string;
  block_number: number;
  block_timestamp: number;
}

export interface DBUser {
  id: number;
  created_at: string;
  updated_at: string;
  address: string;
  ens_name: string | null;
  ens_avatar: string | null;
  farcaster_name: string | null;
  farcaster_avatar: string | null;
}

export interface DBMessage {
  id: number;
  user_id: number;
  bounty: number | null;
  txn_hash: string | null;
  rand_hash: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBAeye {
  id: number;
  token: number;
  context: string;
  headline: string;
  lede: string;
  signal: string;
  emotion: string;
  image: string | null;
  state: "new" | "composed" | "generated" | "minted";
  created_at: string;
  updated_at: string;
}
