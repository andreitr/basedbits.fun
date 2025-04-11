"use client";

import { UserAvatar } from "@/app/lib/components/client/UserAvatar";
import { UserName } from "@/app/lib/components/client/UserName";
import { DBCheckin, DBUser } from "@/app/lib/types/types";
import Link from "next/link";

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
          <UserAvatar user={user} size={62} />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="text-3xl font-semibold">
              <UserName user={user} />
            </div>
            {user.farcaster_name && (
              <Link
                href={`https://warpcast.com/${user.farcaster_name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </Link>
            )}
          </div>
          <div className="text-[#363E36] uppercase">{title}</div>
        </div>
      </div>
    </div>
  );
};
