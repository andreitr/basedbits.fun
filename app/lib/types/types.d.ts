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
  lastCheckin: BigNumber;
  streak: number;
  count: number;
};
