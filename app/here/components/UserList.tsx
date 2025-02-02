"use client";

import { Avatar } from "connectkit";
import Link from "next/link";

interface Props {
  users: string[];
}

export const UserList = ({ users }: Props) => {
  return (
    <div className="flex flex-wrap gap-2">
      {users.map((checkin, index) => {
        return (
          <div className="flex" key={index}>
            <Link href={`/users/${checkin}`}>
              <Avatar address={checkin as `0x${string}`} size={42} />
            </Link>
          </div>
        );
      })}
    </div>
  );
};
