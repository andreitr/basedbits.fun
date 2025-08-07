import { useReadContract } from "wagmi";
import { PotRaiderABI } from "../../abi/PotRaider.abi";

export const useLotteryJackpot = ({ enabled }: { enabled: boolean }) => {
  return { data: 1081537203552 };

  // TODO: Fix this
  // return useReadContract({
  //     abi: PotRaiderABI,
  //     address: process.env.NEXT_PUBLIC_RAIDER_ADDRESS as `0x${string}`,
  //     functionName: "getLotteryJackpot",
  //     query: {
  //         enabled: enabled,
  //       },
  //   });
};
