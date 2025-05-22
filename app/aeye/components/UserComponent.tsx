"use client";

import { UserAvatar } from "@/app/lib/components/client/UserAvatar";
import { UserName } from "@/app/lib/components/client/UserName";
import { useUser } from "@/app/lib/hooks/useUser";
import { useAccount } from "wagmi";

export const UserComponent = () => {
    const { address } = useAccount();
    const { data: user } = useUser({ address: address as `0x${string}`, enabled: !!address });

    if (!user) {
        return null;
    }

    return (
        <div className="flex flex-row items-center justify-between bg-white rounded-lg p-4 w-full">
            <div className="flex flex-row gap-2 items-center">
                <div className="flex rounded-full p-0.5 bg-black bg-opacity-80 w-10 h-10">
                    <UserAvatar user={user} size={36} />
                </div>
            <UserName user={user} />
            </div>
            <div className="flex flex-row gap-4">

            <div className="text-blue-500">Streak 2</div>
            <div className="text-blue-500">Total Minted</div>
            <div className="text-blue-500">Rewards 0.123ETH</div>
            </div>
        </div>
    )
}
