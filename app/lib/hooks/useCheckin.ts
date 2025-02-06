import { useReadContract } from "wagmi";
import { BBitsCheckInABI } from "@/app/lib/abi/BBitsCheckIn.abi";

interface Props {
  address: string | undefined;
  enabled: boolean;
}

export const useCheckin = ({ address, enabled }: Props) => {
  return useReadContract({
    abi: BBitsCheckInABI,
    address: process.env.NEXT_PUBLIC_BB_CHECKINS_ADDRESS as `0x${string}`,
    functionName: "checkIns",
    args: [address],
    query: {
      enabled: enabled && !!address,
    },
  });
};
