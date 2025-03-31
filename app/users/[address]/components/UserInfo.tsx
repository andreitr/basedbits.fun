"use client";

import { DBCheckin, DBUser } from "@/app/lib/types/types";
import { truncateAddress } from "@/app/lib/utils/addressUtils";
import { Avatar } from "connectkit";

interface Props {
  checkin: DBCheckin;
  user: DBUser;
}

export const UserInfo = ({ user, checkin }: Props) => {
  const { streak, count } = checkin;
  const title = `${streak}-day streak 🔥 ${count} check-in${count === 1 ? "" : "s"}`;


  return (
    <div>
      <div className="flex flex-row gap-4 items-center">
        <div className="flex rounded-full p-1 bg-black bg-opacity-50">
          <Avatar address={user.address as `0x${string}`} size={62} />
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-3xl font-semibold">
            {user.ens_name || truncateAddress(user.address)}
          </div>
          <div className="text-[#363E36] uppercase">{title}</div>
        </div>
      </div>
    </div>
  );
};
