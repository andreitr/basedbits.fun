"use client";

import { Tooltip } from "@/app/lib/components/client/Tooltip";
import { UserAvatar } from "@/app/lib/components/client/UserAvatar";
import { UserName } from "@/app/lib/components/client/UserName";
import { useCheckins } from "@/app/lib/hooks/useCheckins";
import { formatTimeAgo } from "@/app/lib/utils/timeUtils";
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
        const tooltipContent = (
          <div className="min-w-[200px]">
            <UserName user={checkin.user} />

            <div className="text-xs mt-2 text-gray-400">
              Checked in {formatTimeAgo(checkin.block_timestamp)}
            </div>
          </div>
        );

        return (
          <div className="flex items-center justify-center" key={index}>
            <Tooltip content={tooltipContent}>
              <Link
                href={`/users/${getAddress(checkin.user.address)}`}
                prefetch={true}
              >
                <div className="flex rounded-full p-0.5 bg-black bg-opacity-80 transition-all duration-300 hover:bg-opacity-100">
                  <UserAvatar user={checkin.user} size={36} />
                </div>
              </Link>
            </Tooltip>
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
