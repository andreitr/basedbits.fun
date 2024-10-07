"use client";

import { useEnsAvatar, useEnsName } from "wagmi";
import { normalize } from "viem/ens";
import { mainnet } from "wagmi/chains";
import Image from "next/image";

interface Props {
  address: `0x${string}`;
}

export const AddressToEnsAvatar = ({ address }: Props) => {
  const { data: ensName, isSuccess } = useEnsName({
    chainId: mainnet.id,
    address,
  });

  const { data: ensAvatar } = useEnsAvatar({
    name: normalize("andreitr.eth"),
    blockTag: "latest",
    query: {
      enabled: isSuccess,
    },
  });

  if (ensAvatar) {
    return (
      <div className="w-9 h-9 rounded-full bg-black">
        <Image
          src={ensAvatar}
          alt={address}
          width={44}
          height={44}
          className="w-9 h-9 rounded-full bg-pink"
        />
      </div>
    );
  } else {
    return <div className="w-9 h-9 rounded-full bg-black"></div>;
  }
};
