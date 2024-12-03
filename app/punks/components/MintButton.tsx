"use client";

import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { ConnectAction } from "@/app/lib/components/ConnectAction";
import { formatUnits } from "ethers";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSocialDisplay } from "@/app/lib/hooks/useSocialDisplay";
import { PunkalotABI } from "@/app/lib/abi/Punkalot.abi";
import { useQueryClient } from "@tanstack/react-query";

export const MintButton = () => {
  const [refresh, setRefresh] = useState(false);
  const { isConnected, address } = useAccount();
  const { data, writeContract } = useWriteContract();
  const queryClient = useQueryClient();
  const { isFetching, isSuccess } = useWaitForTransactionReceipt({
    hash: data,
  });

  const { data: mintPrice, isFetched: hasMintPrice } = useReadContract({
    abi: PunkalotABI,
    address: process.env.NEXT_PUBLIC_PUNKALOT_ADDRESS as `0x${string}`,
    functionName: "userMintPrice",
    args: [address],
    query: {
      enabled: isConnected,
    },
  });

  const { show } = useSocialDisplay({
    message:
      "I just minted a Punkalot and burned some Based Bits! Check it out!",
    title: "Punkalot minted! Please spread the word 🙏",
    url: "https://basedbits.fun/punks",
  });

  const mint = () => {
    if (!mintPrice) {
      toast.error("Unable to calculate mint price. Please try again later.");
      return;
    }

    writeContract({
      abi: PunkalotABI,
      address: process.env.NEXT_PUBLIC_PUNKALOT_ADDRESS as `0x${string}`,
      functionName: "mint",
      value: mintPrice as any,
    });
  };

  useEffect(() => {
    if (isSuccess && !refresh) {
      show();
      queryClient.invalidateQueries({
        queryKey: [
          "getNFTsForCollection",
          process.env.NEXT_PUBLIC_PUNKALOT_ADDRESS,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: ["getNFTsForOwner", process.env.NEXT_PUBLIC_PUNKALOT_ADDRESS],
      });
      setRefresh(true);
    }
  }, [isSuccess, refresh]);

  const label =
    hasMintPrice && mintPrice
      ? `Mint for ${formatUnits(mintPrice as any, 18).slice(0, 7)}Ξ`
      : `Calculating your mint price...`;

  if (!isConnected) {
    return <ConnectAction action={"to mint"} />;
  }

  return (
    <button
      className="bg-[#53A3FC] hover:bg-[#3B7AFF] text-xl font-bold py-3 px-4 rounded-lg w-full sm:w-auto"
      onClick={() => {
        mint();
        setRefresh(false);
      }}
      disabled={isFetching}
    >
      {isFetching ? "Minting..." : label}
    </button>
  );
};
