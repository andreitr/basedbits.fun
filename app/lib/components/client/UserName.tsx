"use client";

import { DBUser } from "@/app/lib/types/types";
import { truncateAddress } from "@/app/lib/utils/addressUtils";

interface Props {
  user: DBUser;
}

export const UserName = ({ user }: Props) => {
  return user.farcaster_name || user.ens_name || truncateAddress(user.address);
};
