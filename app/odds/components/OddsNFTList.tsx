"use client";

import { formatEth, formatUsdc } from "@/app/odds/components/OddsStats";
import { EVIL_ODDS_ADDRESS } from "@/app/lib/contracts/evilodds";
import { useOddsStats } from "@/app/lib/hooks/evilodds/useOddsStats";
import { useOddsBurn } from "@/app/lib/hooks/evilodds/useOddsWrite";
import { useRefreshOdds } from "@/app/lib/hooks/evilodds/useRefreshOdds";
import { useGetOwnerNFTs } from "@/app/lib/hooks/useGetOwnerNFTs";
import { AlchemyToken } from "@/app/lib/types/alchemy";
import { truncateAddress } from "@/app/lib/utils/addressUtils";
import {
  NFTGridSkeleton,
  NFTImage,
  NFTTile,
  nftGridClass,
} from "@/app/lib/components/NFTGrid";
import { useWallet } from "@/app/lib/Web3Provider";
import toast from "react-hot-toast";

const tileClass = "bg-black bg-opacity-90";

export const OddsNFTList = () => {
  const { isReady, isConnected, address } = useWallet();
  const { data: list, isLoading } = useGetOwnerNFTs({
    address,
    contract: EVIL_ODDS_ADDRESS,
  });

  // Clipped to the tab panel's reserved height so it doesn't collapse if the wallet turns out to be disconnected
  if (!isReady) {
    return (
      <div className="h-[320px] overflow-hidden">
        <NFTGridSkeleton count={5} tileClassName={tileClass} />
      </div>
    );
  }

  if (!isConnected || !address) {
    return <div>Connect wallet to view your Odds 👻</div>;
  }

  if (isLoading) {
    return <NFTGridSkeleton count={5} tileClassName={tileClass} />;
  }

  if (!list?.ownedNfts?.length) {
    return <div>No Odds found in {truncateAddress(address)}.</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className={nftGridClass}>
        {list.ownedNfts.map((nft) => (
          <NFTCard key={nft.tokenId} nft={nft} />
        ))}
      </div>
    </div>
  );
};

const NFTCard = ({ nft }: { nft: AlchemyToken }) => {
  const { data: stats } = useOddsStats();
  const refresh = useRefreshOdds();
  const { burn, isPending, isConfirming, isSuccess } = useOddsBurn(() => {
    toast.success("Burned and redeemed");
    refresh();
  });

  const hasPayout =
    !!stats && (stats.redeemEth > BigInt(0) || stats.redeemUsdc > BigInt(0));
  const busy = isPending || isConfirming;

  return (
    <NFTTile className={tileClass}>
      <NFTImage src={nft.image?.originalUrl} alt={nft.name} />
      <div className="mt-2 w-full text-[#FFE29E] text-sm text-center">
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
    </NFTTile>
  );
};
