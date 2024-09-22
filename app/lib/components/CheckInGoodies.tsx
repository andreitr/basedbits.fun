import { streakToDiscount } from "@/app/lib/utils/numberUtils";
import Link from "next/link";
import { AddressToEns } from "@/app/lib/components/AddressToEns";

interface Props {
  streak: number;
  address: string;
}

export const CheckInGoodies = ({ streak, address }: Props) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="font-semibold uppercase text-[#363E36]">
        you have a {streak}-day streak 🔥{" "}
        <Link
          className="hover:no-underline underline text-[#0000FF]"
          href={`/users/${address}`}
        >
          <AddressToEns address={address as `0x${string}`} />
        </Link>
      </div>

      <div className="flex flex-col text-black mb-6 bg-white bg-opacity-80 rounded-lg p-4 gap-1">
        <div>
          • {streakToDiscount(streak)}% OFF on{" "}
          <Link
            className="hover:no-underline underline text-[#0000FF]"
            href={`/bit98`}
          >
            Bit98
          </Link>{" "}
          mint
        </div>
        <div>
          • Free{" "}
          <Link
            className="hover:no-underline underline text-[#0000FF]"
            href={`/raffle`}
          >
            Daily Raffle
          </Link>{" "}
          entry
        </div>
        {streak > 7 && <div>• Community social posts</div>}
      </div>
    </div>
  );
};
