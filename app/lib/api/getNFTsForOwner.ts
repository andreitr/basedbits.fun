import { baseNFTUrl } from "@/app/lib/Web3Configs";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import type { AlchemyUserResponse } from "@/app/lib/types/alchemy";

interface Props {
  address: string | undefined;
  contract: string;
  pageKey?: string;
  size?: number;
}

// Read contract data
export const fetchNFTsForOwner = async ({
  address,
  contract,
  pageKey,
  size,
}: Props) => {
  const params = new URLSearchParams({
    owner: address ?? "",
    "contractAddresses[]": contract,
    withMetadata: "true",
  });
  if (size !== undefined) params.set("pageSize", String(size));
  if (pageKey) params.set("pageKey", pageKey);

  const response = await fetch(`${baseNFTUrl}/getNFTsForOwner?${params}`, {
    next: {
      revalidate: 43_200, // 12 hours
      tags: [`getNFTsForOwner-${address}`],
    },
  });
  return (await response.json()) as AlchemyUserResponse;
};

// Avoid duplicate concurrent calls by wrapping the function in a cache
const cachedFetchNFTsForOwner = cache(fetchNFTsForOwner);

// Cache results on the server
export const getNFTsForOwner = (props: Props) =>
  unstable_cache(
    () => cachedFetchNFTsForOwner(props),
    [`getNFTsForOwner-${props.address}`],
    {
      tags: [`getNFTsForOwner-${props.address}`],
      revalidate: 43_200, // 12 hours
    },
  )();
