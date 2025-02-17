"use client";

import { Avatar } from "connectkit";
import Link from "next/link";
import { getAddress } from "ethers";
import { useCheckins } from "@/app/lib/hooks/useCheckins";
import { Tooltip } from "@/app/lib/components/client/Tooltip";

export const UserList = () => {
  const { data: users, isError } = useCheckins({ enabled: true });

  if (isError) {
    return null;
  }

  if (!users) {
    return <UserListSekeleton />;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {users.map((checkin, index) => {
        return (
          <div className="flex items-center justify-center" key={index}>
            <Link href={`/users/${getAddress(checkin)}`}>
              <div className="flex rounded-full p-0.5 bg-black bg-opacity-80 transition-all duration-300 hover:bg-opacity-100">
                <Avatar address={checkin as `0x${string}`} size={36} />
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

const UserListSekeleton = () => {
  const placeholders = Array.from({ length: 38 });
  return (
    <div className="flex flex-wrap gap-2">
      {placeholders.map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-black bg-opacity-30 animate-pulse"
        />
      ))}
    </div>
  );
};
