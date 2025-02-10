"use client";

import { Avatar } from "connectkit";
import Link from "next/link";
import { getAddress } from "ethers";

interface Props {
  users: string[];
}

export const UserList = ({ users }: Props) => {
  return (
    <div className="flex flex-wrap gap-2">
      {users.map((checkin, index) => {
        return (
          <div className="flex items-center justify-center" key={index}>
            <Link href={`/users/${getAddress(checkin)}`}>
              <div className="flex rounded-full p-0.5 bg-black bg-opacity-50 transition-all duration-300 hover:bg-opacity-100">
                <Avatar address={checkin as `0x${string}`} size={36} />
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
};
