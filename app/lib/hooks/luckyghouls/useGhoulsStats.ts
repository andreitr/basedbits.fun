import { LuckyGhoulsABI } from "@/app/lib/abi/LuckyGhouls.abi";
import { LUCKY_GHOULS_ADDRESS } from "@/app/lib/contracts/luckyghouls";
import { useQueryClient } from "@tanstack/react-query";
import { useBalance, useReadContracts } from "wagmi";
import { base } from "wagmi/chains";

const contract = {
  abi: LuckyGhoulsABI,
  address: LUCKY_GHOULS_ADDRESS,
  chainId: base.id,
} as const;

export interface GhoulsStats {
  mintPrice: bigint;
  totalMinted: bigint;
  totalSupply: bigint;
  maxSupply: bigint;
  maxMintPerTx: bigint;
  paused: boolean;
  redeemEth: bigint;
  redeemUsdc: bigint;
  dailyEthBudget: bigint;
  completedPurchaseDays: bigint;
  totalPurchaseDays: bigint;
  jackpot: bigint;
  nextDrawingTime: bigint;
  treasuryEth: bigint;
}

// Everything the /ghouls page shows, refreshed every 30s so the redeem value stays current
export const useGhoulsStats = (options: { enabled?: boolean } = {}) => {
  const { enabled = true } = options;
  const queryClient = useQueryClient();

  const reads = useReadContracts({
    allowFailure: false,
    contracts: [
      { ...contract, functionName: "mintPrice" },
      { ...contract, functionName: "totalMinted" },
      { ...contract, functionName: "totalSupply" },
      { ...contract, functionName: "MAX_SUPPLY" },
      { ...contract, functionName: "maxMintPerTx" },
      { ...contract, functionName: "paused" },
      { ...contract, functionName: "getBurnPayoutPerToken" },
      { ...contract, functionName: "getDailyEthBudget" },
      { ...contract, functionName: "completedPurchaseDays" },
      { ...contract, functionName: "totalPurchaseDays" },
      { ...contract, functionName: "getMegapotJackpot" },
      { ...contract, functionName: "getNextDrawingTime" },
    ],
    query: { enabled, refetchInterval: 30_000 },
  });

  const balance = useBalance({
    address: LUCKY_GHOULS_ADDRESS,
    chainId: base.id,
    query: { enabled, refetchInterval: 30_000 },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: reads.queryKey });
    queryClient.invalidateQueries({ queryKey: balance.queryKey });
  };

  let data: GhoulsStats | undefined;
  if (reads.data && balance.data) {
    const [
      mintPrice,
      totalMinted,
      totalSupply,
      maxSupply,
      maxMintPerTx,
      paused,
      [redeemEth, redeemUsdc],
      dailyEthBudget,
      completedPurchaseDays,
      totalPurchaseDays,
      jackpot,
      nextDrawingTime,
    ] = reads.data;
    data = {
      mintPrice,
      totalMinted,
      totalSupply,
      maxSupply,
      maxMintPerTx,
      paused,
      redeemEth,
      redeemUsdc,
      dailyEthBudget,
      completedPurchaseDays,
      totalPurchaseDays,
      jackpot,
      nextDrawingTime,
      treasuryEth: balance.data.value,
    };
  }

  return {
    data,
    isLoading: reads.isLoading || balance.isLoading,
    isError: reads.isError || balance.isError,
    invalidate,
  };
};
