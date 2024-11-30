import { useEffect, useState } from "react";
import { AlchemyToken } from "@/app/lib/types/alchemy";
import { useAccount } from "wagmi";
import { useGetUserNFTs } from "@/app/lib/hooks/useGetUserNFTs";
import { ConnectAction } from "@/app/lib/components/ConnectAction";

interface Props {
  contract: string;
}

export const TabUser = ({ contract }: Props) => {
  const [pageKey, setPageKey] = useState<string>("");
  const [tokens, setTokens] = useState<AlchemyToken[]>([]);
  const { isConnected, address } = useAccount();

  const { data, isPlaceholderData, isLoading } = useGetUserNFTs({
    address: address,
    contract: contract,
    pageKey: pageKey,
    size: 42,
  });

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
        There are no Punksalot in your wallet! Mint one now 👆
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
                  style={{ backgroundImage: `url(${nft.image.thumbnailUrl})` }}
                ></div>
                <div className="mt-2 hover:underline text-white">
                  {nft.name}
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
