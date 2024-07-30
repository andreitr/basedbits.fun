"use client";

import { useAccount, useReadContract } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { BBitsTokenAbi } from "@/app/lib/abi/BBitsToken.abi";
import { BigNumberish, formatUnits } from "ethers";
import { ApproveTokenButton } from "@/app/token/components/ApproveTokenButton";
import { humanizeNumber } from "@/app/lib/utils/numberUtils";

export const ApproveToken = () => {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();

  const { data, isFetched, queryKey } = useReadContract({
    abi: BBitsTokenAbi,
    address: process.env.NEXT_PUBLIC_BB_TOKEN_ADDRESS as `0x${string}`,
    functionName: "allowance",
    args: [address, process.env.NEXT_PUBLIC_BB_TOKEN_ADDRESS as `0x${string}`],
    query: {
      enabled: isConnected,
    },
  });

  if (!isFetched) {
    return null;
  }

  const invalidateQuery = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  const hasSpendingAllowance = Number(formatUnits(data as any)) > 0;

  const styles = hasSpendingAllowance
    ? "bg-[#ABBEAC]"
    : "bg-[#303730] text-[#DDF5DD]";

  return (
    <div className={`p-6 rounded-md text-sm ${styles}`}>
      {data && hasSpendingAllowance ? (
        <div>
          You can swap{" "}
          <span className="font-bold">
            {humanizeNumber(
              Math.round(Number(formatUnits(data as BigNumberish))),
            )}
          </span>{" "}
          BBITS for NFTs.{" "}
          <ApproveTokenButton
            address={address as `0x${string}`}
            onSuccess={invalidateQuery}
            approve={hasSpendingAllowance}
          />
        </div>
      ) : (
        <div>
          <div className="mb-2">
            To exchange your tokens for NFTs, grant the BBITS Token contract
            permission to spend your tokens.
          </div>
          <ApproveTokenButton
            address={address as `0x${string}`}
            onSuccess={invalidateQuery}
            approve={hasSpendingAllowance}
          />
        </div>
      )}
    </div>
  );
};
