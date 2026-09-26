"use client";

import { formatEth, formatUsdc } from "@/app/ghouls/components/GhoulsStats";
import { LUCKY_GHOULS_ADDRESS } from "@/app/lib/contracts/luckyghouls";
import { useGhoulsStats } from "@/app/lib/hooks/luckyghouls/useGhoulsStats";
import { useGhoulsBurn } from "@/app/lib/hooks/luckyghouls/useGhoulsWrite";
import { useRefreshGhouls } from "@/app/lib/hooks/luckyghouls/useRefreshGhouls";
import { useGetOwnerNFTs } from "@/app/lib/hooks/useGetOwnerNFTs";
import { AlchemyToken } from "@/app/lib/types/alchemy";
import { truncateAddress } from "@/app/lib/utils/addressUtils";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";

export const GhoulsNFTList = () => {
  const { isConnected, address } = useAccount();
  const { data: list, isLoading } = useGetOwnerNFTs({
    address,
    contract: LUCKY_GHOULS_ADDRESS,
  });

  if (!isConnected || !address) {
    return <div>Connect wallet to view your Ghouls 👻</div>;
  }

  if (isLoading) {
    return <div className="animate-pulse">Loading your Ghouls...</div>;
  }

  if (!list?.ownedNfts?.length) {
    return <div>No Ghouls found in {truncateAddress(address)}.</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid justify-items-stretch gap-4 lg:grid-cols-5 grid-cols-2">
        {list.ownedNfts.map((nft) => (
          <NFTCard key={nft.tokenId} nft={nft} />
        ))}
      </div>
    </div>
  );
};

const NFTCard = ({ nft }: { nft: AlchemyToken }) => {
  const { data: stats } = useGhoulsStats();
  const refresh = useRefreshGhouls();
  const { burn, isPending, isConfirming, isSuccess } = useGhoulsBurn(() => {
    toast.success(`Ghoul #${nft.tokenId} burned and redeemed`);
    refresh();
  });

  const hasPayout =
    !!stats && (stats.redeemEth > BigInt(0) || stats.redeemUsdc > BigInt(0));
  const busy = isPending || isConfirming;

  return (
    <div className="flex flex-col bg-black bg-opacity-90 p-2 rounded-md items-center justify-center w-full">
      <div
        className="bg-cover bg-center bg-no-repeat w-full aspect-square rounded-lg"
        style={{ backgroundImage: `url(${nft.image?.originalUrl})` }}
        title={nft.name}
      ></div>
      <div className="mt-2 w-full text-[#FFE29E] text-sm text-center">
        <div className="text-white/60 text-xs pb-1">#{nft.tokenId}</div>
        <button
          className="cursor-pointer w-full hover:underline disabled:cursor-default disabled:no-underline disabled:opacity-50"
          onClick={() => burn(BigInt(nft.tokenId))}
          disabled={!hasPayout || busy || isSuccess}
        >
          <div>
            {isSuccess
              ? "Redeemed!"
              : isPending
                ? "Confirming..."
                : isConfirming
                  ? "Burning..."
                  : hasPayout
                    ? "Burn for"
                    : "Nothing to redeem yet"}
          </div>
          {hasPayout && stats && !isSuccess && (
            <div className="flex flex-row gap-1 sm:gap-2 pt-1 flex-wrap justify-center">
              <div>{formatEth(stats.redeemEth)}</div>
              {stats.redeemUsdc > BigInt(0) && (
                <div>{formatUsdc(stats.redeemUsdc)}</div>
              )}
            </div>
          )}
        </button>
      </div>
    </div>
  );
};
