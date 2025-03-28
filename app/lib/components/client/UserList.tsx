"use client";

import { useCheckins } from "@/app/lib/hooks/useCheckins";
import { Avatar } from "connectkit";
import Image from "next/image";
import { getAddress } from "ethers";
import Link from "next/link";

export const UserList = () => {
  const { data: users, isError } = useCheckins({ enabled: true });

  if (isError) {
    return null;
  }

  if (!users) {
    return <UserListSkeleton />;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {users.map((checkin, index) => {
        return (
          <div className="flex items-center justify-center" key={index}>
            <Link href={`/users/${getAddress(checkin.user.address)}`}>
              <div className="flex rounded-full p-0.5 bg-black bg-opacity-80 transition-all duration-300 hover:bg-opacity-100">
                <Avatar
                  address={checkin.user.address as `0x${string}`}
                  size={36}
                />
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

const UserListSkeleton = () => {
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
