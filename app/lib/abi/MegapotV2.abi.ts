import { parseAbi } from "viem";

// Megapot V2 on Base, the Jackpot LuckyGhouls buys tickets from
export const MEGAPOT_V2_JACKPOT_ADDRESS =
  "0x3bAe643002069dBCbcd62B1A4eb4C4A397d042a2" as const;

export const MegapotV2JackpotABI = parseAbi([
  "function currentDrawingId() view returns (uint256)",
  "function getDrawingState(uint256 _drawingId) view returns ((uint256 prizePool, uint256 ticketPrice, uint256 edgePerTicket, uint256 referralWinShare, uint256 referralFee, uint256 globalTicketsBought, uint256 lpEarnings, uint256 drawingTime, uint256 winningTicket, uint8 ballMax, uint8 bonusballMax, address payoutCalculator, bool jackpotLock))",
  "function getTicketTierIds(uint256[] _ticketIds) view returns (uint256[] tierIds)",
]);

export const MegapotV2PayoutCalculatorABI = parseAbi([
  "function getExpectedDrawingTierPayouts(uint256 _drawingId, uint256 _prizePool, uint8 _normalMax, uint8 _bonusballMax) view returns (uint256[12] drawingTierPayouts)",
]);

// 5 normals + bonusball
export const MEGAPOT_TOP_TIER = 11;
