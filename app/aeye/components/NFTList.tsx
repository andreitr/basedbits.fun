import { DBAeye } from "@/app/lib/types/types";
import Image from "next/image";
import Link from "next/link";

interface Props {
    list: DBAeye[];
}

export default function NFTList({ list }: Props) {

    return (
        <div className="grid justify-items-stretch gap-4 lg:grid-cols-5 grid-cols-2">
      {list.map((nft, index) => {
        return (
          <div
            key={index}
            className="flex flex-col bg-black/90 p-2 rounded-md items-center justify-center text-sm"
          >
            <Image
              className="bg-cover bg-center bg-no-repeat lg:w-[175px] lg:h-[175px] w-[115px] h-[115px] rounded-lg"
              src={nft.image || ""}
              alt={nft.headline}
              width={175}
              height={175}
            />
            <div className="mt-2">
              <Link
                href={`https://testnets.opensea.io/assets/base/${process.env.NEXT_PUBLIC_AEYE_ADDRESS}/${nft.id}`}
                target="_blank"
                className="text-gray-400 hover:underline"
              >
                Dispatch #{nft.id}
              </Link>
            </div>
          </div>
        );
      })}
    </div>
    )
}