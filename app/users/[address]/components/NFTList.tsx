import Link from "next/link";
import { AlchemyToken } from "@/app/lib/types/alchemy";

interface Props {
  list: AlchemyToken[];
}

export const NFTList = ({ list }: Props) => {
  return (
    <div>
      <div className="grid justify-items-stretch gap-4 lg:grid-cols-5 grid-cols-2">
        {list.map((nft, index) => {
          return (
            <div
              key={index}
              className="flex flex-col bg-[#ABBEAC] p-2 rounded-md items-center justify-center"
            >
              <div
                className="bg-cover bg-center bg-no-repeat lg:w-[175px] lg:h-[175px] w-[115px] h-[115px] rounded-lg"
                style={{ backgroundImage: `url(${nft.image.originalUrl})` }}
              ></div>
              <div className="mt-2">
                <Link
                  href={`https://opensea.io/assets/base/${nft.contract.address}/${nft.tokenId}`}
                  target="_blank"
                  className="hover:underline"
                >
                  {nft.name}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const NFTListSkeleton = () => {
  const placeholders = Array.from({ length: 5 });
  return (
    <div className="grid justify-items-stretch gap-4 lg:grid-cols-5 grid-cols-2">
      {placeholders.map((_, index) => (
        <div
          key={index}
          className="flex flex-col bg-[#ABBEAC] p-2 rounded-md items-center justify-center animate-pulse"
        >
          <div className="mb-8 lg:w-[175px] lg:h-[175px] w-[115px] h-[115px] rounded-lg bg-black bg-opacity-20"></div>
        </div>
      ))}
    </div>
  );
};
