"use client";

import { useAccount, useReadContract } from "wagmi";
import { ApproveButton } from "@/app/token/components/ApproveButton";
import { useQueryClient } from "@tanstack/react-query";
import { BBitsTokenAbi } from "@/app/lib/abi/BBitsToken.abi";
import { formatUnits } from "ethers";

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

  const invalidateQuery = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  const styles = data ? "bg-[#ABBEAC]" : "bg-[#303730] text-[#DDF5DD]";
  if (isFetched) {
    return (
      <div className={`p-6 rounded-md ${styles}`}>
        {data && Number(formatUnits(data as any)) > 0 ? (
          <div>
            {Number(formatUnits(data as any))}
            Your NFTs are ready to be swapped for tokens. Feel free to revoke
            the NFT transfer permissions once you are done playing around.{" "}
            <ApproveButton
              onSuccess={invalidateQuery}
              approve={Boolean(data)}
            />
          </div>
        ) : (
          <div>
            To exchange your tokens for NFTs, you need to grant the BBITS Token
            Contract permission to transfer your tokens. You can revoke this
            permission at any time.{" "}
            <ApproveButton
              onSuccess={invalidateQuery}
              approve={Boolean(data)}
            />
          </div>
        )}
      </div>
    );
  }
};
