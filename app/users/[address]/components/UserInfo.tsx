"use client";

import { CheckIn } from "@/app/lib/types/types";
import { Avatar } from "connectkit";
import { ENSName } from "@/app/lib/components/client/ENSName";

interface Props {
  checkin: CheckIn;
  address: string;
}

export const UserInfo = ({ checkin, address }: Props) => {
  const title = `${checkin.streak}-day streak 🔥 ${checkin.count} check-in${checkin.count === 1 ? "" : "s"}`;

  return (
    <div>
      <div className="flex flex-row gap-4 items-center">
        <div className="flex rounded-full p-1 bg-black bg-opacity-50">
          <Avatar address={address as `0x${string}`} size={62} />
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-3xl font-semibold">
            <ENSName address={address as `0x${string}`} />
          </div>
          <div className="text-[#363E36] uppercase">{title}</div>
        </div>
      </div>
    </div>
  );
};
