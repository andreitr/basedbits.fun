import { DateTime } from "luxon";
import Image from "next/image";
import Link from "next/link";

export default function NFTList() {
  // For now, we'll show a placeholder since we don't have PotRaider data yet
  // This can be enhanced later with actual PotRaider NFT data

  return (
    <div className="grid justify-items-stretch gap-4 lg:grid-cols-5 md:grid-cols-3 grid-cols-2">
      {Array.from({ length: 10 }, (_, index) => (
        <div
          key={index}
          className="flex flex-col bg-black/90 p-2 rounded-md items-center justify-center text-sm"
        >
          <div className="w-full">
            <div className="bg-gray-800 w-full h-auto aspect-square rounded-lg flex items-center justify-center">
              <div className="text-2xl">🏴‍☠️</div>
            </div>
          </div>
          <div className="mt-2 self-start text-gray-400 p-2">
            <Link
              href={`https://opensea.io/item/base/${process.env.NEXT_PUBLIC_RAIDER_ADDRESS}/${index + 1}`}
              target="_blank"
              className="hover:underline"
            >
              PotRaider #{index + 1}
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
