import { useEffect, useState } from "react";
import { AlchemyToken } from "@/app/lib/types/alchemy";
import { useAccount } from "wagmi";
import { useGetUserNFTs } from "@/app/lib/hooks/useGetUserNFTs";
import { ConnectAction } from "@/app/lib/components/ConnectAction";
import { useShuffleTraits } from "@/app/lib/hooks/useShuffleTraits";
import toast from "react-hot-toast";
import { getNFTRawMetadata } from "@/app/lib/api/getNFTRawMetadata";
import { RawMetadata } from "@/app/lib/types/types";
import { PunkalotABI } from "@/app/lib/abi/Punkalot.abi";

interface Props {
  contract: string;
}

export const TabUser = ({ contract }: Props) => {
  const [pageKey, setPageKey] = useState<string>("");
  const [tokens, setTokens] = useState<AlchemyToken[]>([]);
  const [tokenId, setTokenId] = useState<number | undefined>();
  const { isConnected, address } = useAccount();
  const [newMeta, setNewMeta] = useState<RawMetadata>();

  const {
    write: shuffleTraits,
    isFetching,
    isSuccess,
    isError,
  } = useShuffleTraits();

  const { data, isPlaceholderData, isLoading } = useGetUserNFTs({
    address: address,
    contract: contract,
    pageKey: pageKey,
    size: 42,
  });

  const onShuffleTraits = (tokenId: number) => {
    setTokenId(tokenId);
    shuffleTraits(tokenId);
  };

  const isSameToken = (id: string) => {
    return tokenId === Number(id);
  };

  useEffect(() => {
    if (isError) {
      toast.error("There was an error shuffling traits. Please try again.", {
        duration: 6000,
      });
    }
    if (isSuccess) {
      getNFTRawMetadata({
        abi: PunkalotABI,
        address: process.env.NEXT_PUBLIC_PUNKALOT_ADDRESS as `0x${string}`,
        id: Number(tokenId),
      })
        .then((meta) => {
          setNewMeta(meta);
        })
        .finally(() => {
          toast.success("Traits shuffled successfully!", {
            duration: 6000,
          });
        });
    }
  }, [isSuccess, isError, tokenId]);

  useEffect(() => {
    if (data && data.pageKey !== pageKey) {
      setTokens((prevState) => {
        const newTokens = data?.ownedNfts.filter(
          (nft) =>
            !prevState.some(
              (existingNft) => existingNft.tokenId === nft.tokenId,
            ),
        );
        return [...prevState, ...newTokens];
      });
    }
  }, [data, pageKey]);

  if (!isConnected) {
    return <ConnectAction action={"to see your NFTs"} />;
  }

  if (isLoading) {
    return "Loading ...";
  }

  if (data?.totalCount === 0) {
    return (
      <div className="text-[#677467] text-sm">
        There are no Punks in your wallet! Mint one now 👆
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="grid justify-items-stretch gap-4 lg:grid-cols-5 grid-cols-2">
          {tokens.map((nft, index) => {
            return (
              <div
                key={index}
                className="flex flex-col bg-black bg-opacity-90 p-2 rounded-md items-center justify-center"
              >
                <div
                  className="bg-cover bg-center bg-no-repeat lg:w-[175px] lg:h-[175px] w-[115px] h-[115px] rounded-lg"
                  style={{
                    backgroundImage: `url(${isSameToken(nft.tokenId) && newMeta ? newMeta.image : nft.image.originalUrl})`,
                  }}
                ></div>
                <div className="mt-2 hover:underline text-white">
                  <button
                    className="hover:underline"
                    onClick={() => onShuffleTraits(Number(nft.tokenId))}
                  >
                    {isFetching && isSameToken(nft.tokenId)
                      ? "Shuffling..."
                      : `Shuffle #${nft.tokenId}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {data?.pageKey && (
        <button
          className="text-lg py-4 px-6 mt-8  border border-black rounded-lg"
          onClick={() => {
            setPageKey(data.pageKey);
          }}
        >
          {isPlaceholderData ? "Loading..." : "Load More"}
        </button>
      )}
    </>
  );
};
