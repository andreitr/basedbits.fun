"use client";

import { useAccount, useReadContract } from "wagmi";
import { BBitsNFTABI } from "@/app/lib/abi/BBitsNFT.abi";
import { ApproveNFTButton } from "@/app/token/components/ApproveNFTButton";
import { useQueryClient } from "@tanstack/react-query";

export const ApproveNFT = () => {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();

  const { data, isFetched, queryKey } = useReadContract({
    abi: BBitsNFTABI,
    address: process.env.NEXT_PUBLIC_BB_NFT_ADDRESS as `0x${string}`,
    functionName: "isApprovedForAll",
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
      <div className={`p-6 rounded-md text-sm ${styles}`}>
        {data ? (
          <div>
            Your NFTs are ready to be swapped for tokens.{" "}
            <ApproveNFTButton
              onSuccess={invalidateQuery}
              approve={Boolean(data)}
            />
          </div>
        ) : (
          <div>
            <div className="mb-2">
              To exchange your NFTs for tokens, grant the BBITS Token Contract
              permission to transfer your NFTs.
            </div>
            <ApproveNFTButton
              onSuccess={invalidateQuery}
              approve={Boolean(data)}
            />
          </div>
        )}
      </div>
    );
  }
};
