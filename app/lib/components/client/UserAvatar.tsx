"use client";

import { DBUser } from "@/app/lib/types/types";
import { Avatar } from "connectkit";

interface UserAvatarProps {
  user: DBUser;
  size?: number;
}

export const UserAvatar = ({ user, size = 36 }: UserAvatarProps) => {
  const avatarClasses = "rounded-full";

  if (user.farcaster_avatar) {
    return (
      <img
        src={user.farcaster_avatar}
        alt={user.farcaster_name || "Farcaster avatar"}
        className={avatarClasses}
        style={{ width: size, height: size }}
      />
    );
  }

  if (user.ens_avatar) {
    return (
      <img
        src={user.ens_avatar}
        alt={user.ens_name || "ENS avatar"}
        className={avatarClasses}
        style={{ width: size, height: size }}
      />
    );
  }

  return <Avatar address={user.address as `0x${string}`} size={size} />;
};
