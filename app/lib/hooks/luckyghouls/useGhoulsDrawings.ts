import { LuckyGhoulsABI } from "@/app/lib/abi/LuckyGhouls.abi";
import {
  MEGAPOT_TOP_TIER,
  MEGAPOT_V2_JACKPOT_ADDRESS,
  MegapotV2JackpotABI,
  MegapotV2PayoutCalculatorABI,
} from "@/app/lib/abi/MegapotV2.abi";
import { LUCKY_GHOULS_ADDRESS } from "@/app/lib/contracts/luckyghouls";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { base } from "wagmi/chains";

const ghouls = { abi: LuckyGhoulsABI, address: LUCKY_GHOULS_ADDRESS } as const;
const jackpot = {
  abi: MegapotV2JackpotABI,
  address: MEGAPOT_V2_JACKPOT_ADDRESS,
} as const;

const PRECISE_UNIT = BigInt(10) ** BigInt(18);

export interface ClaimableDrawing {
  drawingId: bigint;
  ticketCount: number;
  // Tickets that matched a paying tier (tier ids 0 and 2 pay nothing)
  winningTickets: number;
}

export interface GhoulsDrawings {
  currentDrawingId: bigint;
  // Top-tier (5 + bonusball) payout net of Megapot's referral win share, as shown on megapot.io
  topPrize: bigint;
  // Today's tickets are fully bought
  ticketsBought: boolean;
  // Today's target and progress (target is 0 until the first buyTickets call of the drawing)
  purchaseTarget: bigint;
  purchaseBought: bigint;
  claimable: ClaimableDrawing[];
}

const queryKey = ["ghoulsDrawings", LUCKY_GHOULS_ADDRESS];

// Megapot drawing state plus the treasury's ticket purchases and unclaimed tickets
export const useGhoulsDrawings = (options: { enabled?: boolean } = {}) => {
  const { enabled = true } = options;
  const client = usePublicClient({ chainId: base.id });
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    enabled: enabled && !!client,
    refetchInterval: 30_000,
    queryFn: async (): Promise<GhoulsDrawings> => {
      const [currentDrawingId, lastCompletedDrawingId, completedDays] =
        await client!.multicall({
          allowFailure: false,
          contracts: [
            { ...jackpot, functionName: "currentDrawingId" },
            { ...ghouls, functionName: "lastCompletedDrawingId" },
            { ...ghouls, functionName: "completedPurchaseDays" },
          ],
        });

      const days = Array.from({ length: Number(completedDays) }, (_, i) =>
        BigInt(i + 1),
      );
      const [drawingState, [purchaseTarget, purchaseBought], history] =
        await Promise.all([
          client!.readContract({
            ...jackpot,
            functionName: "getDrawingState",
            args: [currentDrawingId],
          }),
          client!.readContract({
            ...ghouls,
            functionName: "getPurchaseProgress",
            args: [currentDrawingId],
          }),
          client!.multicall({
            allowFailure: false,
            contracts: days.map(
              (day) =>
                ({
                  ...ghouls,
                  functionName: "purchaseHistoryByDay",
                  args: [day],
                }) as const,
            ),
          }),
        ]);

      // Settled drawings the treasury bought into; the previous drawing is included in case its purchase
      // never completed and so is missing from the history
      const candidates = new Set<bigint>(
        history.map(([, drawingId]) => drawingId),
      );
      if (currentDrawingId > BigInt(0)) {
        candidates.add(currentDrawingId - BigInt(1));
      }
      const settled = Array.from(candidates).filter(
        (id) => id < currentDrawingId,
      );

      const [tierPayouts, unclaimed] = await Promise.all([
        client!.readContract({
          abi: MegapotV2PayoutCalculatorABI,
          address: drawingState.payoutCalculator,
          functionName: "getExpectedDrawingTierPayouts",
          args: [
            currentDrawingId,
            drawingState.prizePool,
            drawingState.ballMax,
            drawingState.bonusballMax,
          ],
        }),
        client!.multicall({
          allowFailure: false,
          contracts: settled.map(
            (id) =>
              ({
                ...ghouls,
                functionName: "getUnclaimedTicketIds",
                args: [id],
              }) as const,
          ),
        }),
      ]);

      const withTickets = settled
        .map((drawingId, i) => ({
          drawingId,
          ids: unclaimed[i],
        }))
        .filter(({ ids }) => ids.length > 0);

      const tiers = withTickets.length
        ? await client!.multicall({
            allowFailure: false,
            contracts: withTickets.map(
              ({ ids }) =>
                ({
                  ...jackpot,
                  functionName: "getTicketTierIds",
                  args: [ids],
                }) as const,
            ),
          })
        : [];

      const claimable = withTickets
        .map(({ drawingId, ids }, i) => ({
          drawingId,
          ticketCount: ids.length,
          winningTickets: tiers[i].filter(
            (tier) => tier !== BigInt(0) && tier !== BigInt(2),
          ).length,
        }))
        .sort((a, b) => Number(b.drawingId - a.drawingId));

      const topTier = tierPayouts[MEGAPOT_TOP_TIER];
      return {
        currentDrawingId,
        topPrize:
          topTier - (topTier * drawingState.referralWinShare) / PRECISE_UNIT,
        ticketsBought: lastCompletedDrawingId === currentDrawingId,
        purchaseTarget,
        purchaseBought,
        claimable,
      };
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    invalidate,
  };
};
