import BigNumber from "bignumber.js";

export type RaffleSponsor = {
    sponsor: `0x${string}`;
    tokenId: BigNumber;
};

export type Raffle = {
    startedAt: BigNumber;
    settledAt: BigNumber;
    winner: `0x${string}`;
    sponsor: RaffleSponsor;
};

export type CheckIn = {
    lastCheckin: BigNumber;
    streak: number
    count: number
}