import BigNumber from "bignumber.js";
import { BigNumberish } from "ethers";

export type RaffleSponsor = {
  sponsor: `0x${string}`;
  tokenId: BigNumber;
};

export type MintEntry = {
  user: `0x${string}`;
  weight: BigNumber;
};
export type Mint = {
  burned: BigNumberish;
  mints: BigNumber;
  rewards: BigNumberish;
  settledAt: BigNumber;
  startedAt: BigNumber;
  tokenId: BigNumber;
  winner: `0x${string}`;
  entries: MintEntry[];
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
