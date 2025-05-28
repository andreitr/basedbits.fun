import { DBAeye } from "@/app/lib/types/types";
import { DateTime } from "luxon";
import Image from "next/image";
import Link from "next/link";

interface Props {
  list: DBAeye[];
}

export default function NFTList({ list }: Props) {
  return (
    <div className="grid justify-items-stretch gap-4 lg:grid-cols-5 md:grid-cols-3 grid-cols-2">
      {list.map((nft, index) => {
        return (
          <div
            key={index}
            className="flex flex-col bg-black/90 p-2 rounded-md items-center justify-center text-sm"
          >
            <div className="w-full">
              <Image
                className="bg-cover bg-center bg-no-repeat w-full h-auto aspect-square rounded-lg"
                src={nft.image || ""}
                alt={nft.headline}
                width={175}
                height={175}
              />
            </div>
            <div className="mt-2 self-start text-gray-400 p-2">
              <Link
                href={`https://testnets.opensea.io/assets/base/${process.env.NEXT_PUBLIC_AEYE_ADDRESS}/${nft.id}`}
                target="_blank"
                className="hover:underline"
              >
                {DateTime.fromISO(nft.created_at).toFormat("MMMM d, yyyy")}
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
