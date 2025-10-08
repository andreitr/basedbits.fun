import { BasePaintRewardsAbi } from "@/app/lib/abi/BasePaintRewards.abi";
import { baseRpcUrl } from "@/app/lib/Web3Configs";
import {
  Contract,
  Interface,
  JsonRpcProvider,
  TransactionReceipt,
  Wallet,
  getAddress,
} from "ethers";
import { Chain, OpenSeaSDK, TokenStandard } from "opensea-js";
import { NextRequest } from "next/server";

const BASEPAINT_REWARDS_ADDRESS = "0xaff1A9E200000061fC3283455d8B0C7e3e728161";
const BASEPAINT_CONTRACT_ADDRESS = "0xBa5e05cb26b78eDa3A2f8e3b3814726305dcAc83";
const REFERRER_ADDRESS = "0xDAdA5bAd8cdcB9e323d0606d081E6Dc5D3a577a1";
const MINT_COUNT = 3;
const MINT_PRICE_WEI = 2_600_000_000_000_000; // 0.0026 ETH per mint
const LISTING_PRICE_ETH = "0.00267";
const LISTING_DURATION_SECONDS = 30 * 24 * 60 * 60; // 30 days
const NFT_PAGE_SIZE = 50;

const checksummedBasePaintAddress = getAddress(BASEPAINT_CONTRACT_ADDRESS);

const erc1155Interface = new Interface([
  "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
  "event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)",
]);

const normalizeAddress = (address?: string | null) => {
  if (!address) {
    return undefined;
  }

  try {
    return getAddress(address);
  } catch (error) {
    console.warn("Failed to normalize address", address, error);
    return undefined;
  }
};

let provider: JsonRpcProvider | null = null;

const getProvider = () => {
  if (!provider) {
    provider = new JsonRpcProvider(baseRpcUrl);
  }

  return provider;
};

export const dynamic = "force-dynamic";

const getOpenSeaClient = (signer: Wallet) =>
  new OpenSeaSDK(signer, {
    chain: Chain.Base,
    apiKey: process.env.OPENSEA_API_KEY,
  });

const getMintedTokenQuantitiesFromReceipt = (
  receipt: TransactionReceipt,
  recipientAddress: string,
) => {
  const mintedTokenQuantities = new Map<string, number>();
  const normalizedRecipient = normalizeAddress(recipientAddress);

  if (!normalizedRecipient) {
    return mintedTokenQuantities;
  }

  for (const log of receipt.logs ?? []) {
    if (normalizeAddress(log.address) !== checksummedBasePaintAddress) {
      continue;
    }

    let parsedLog;

    try {
      parsedLog = erc1155Interface.parseLog(log);
    } catch {
      continue;
    }

    if (parsedLog.name === "TransferSingle") {
      const { to, id, value } = parsedLog.args as unknown as {
        to: string;
        id: bigint;
        value: bigint;
      };

      const normalizedTo = normalizeAddress(to);

      if (normalizedTo !== normalizedRecipient) {
        continue;
      }

      const tokenId = id?.toString?.();
      const numericValue = Number(value);

      if (!tokenId || !Number.isFinite(numericValue) || numericValue <= 0) {
        continue;
      }

      mintedTokenQuantities.set(
        tokenId,
        (mintedTokenQuantities.get(tokenId) ?? 0) + numericValue,
      );
    } else if (parsedLog.name === "TransferBatch") {
      const { to, ids, values } = parsedLog.args as unknown as {
        to: string;
        ids: readonly bigint[];
        values: readonly bigint[];
      };

      const normalizedTo = normalizeAddress(to);

      if (normalizedTo !== normalizedRecipient) {
        continue;
      }

      if (ids.length !== values.length) {
        continue;
      }

      for (let index = 0; index < ids.length; index += 1) {
        const idValue = ids[index];
        const value = values[index];
        const tokenId = idValue?.toString?.();
        const numericValue = Number(value);

        if (!tokenId || !Number.isFinite(numericValue) || numericValue <= 0) {
          continue;
        }

        mintedTokenQuantities.set(
          tokenId,
          (mintedTokenQuantities.get(tokenId) ?? 0) + numericValue,
        );
      }
    }
  }

  return mintedTokenQuantities;
};

const listAllBasePaintNftsForSale = async (
  client: OpenSeaSDK,
  accountAddress: string,
  mintedTokenQuantities: Map<string, number>,
) => {
  const normalizedAccount = normalizeAddress(accountAddress);

  if (!normalizedAccount) {
    throw new Error("Invalid account address provided");
  }
  const expirationTime = Math.floor(Date.now() / 1000) + LISTING_DURATION_SECONDS;
  let cursor: string | undefined;
  const failedTokenIds: string[] = [];
  const processedTokenIds = new Set<string>();

  do {
    const response = await client.api.getNFTsByAccount(
      normalizedAccount,
      NFT_PAGE_SIZE,
      cursor,
      Chain.Base,
    );

    const nfts = response?.nfts ?? [];

    for (const nft of nfts) {
      const nftContract = normalizeAddress(nft.contract);

      if (nftContract !== checksummedBasePaintAddress) {
        continue;
      }

      if (processedTokenIds.has(nft.identifier)) {
        continue;
      }

      const owners = nft.owners ?? [];

      const ownerEntry = owners.find((owner) => {
        const ownerAddress = normalizeAddress(owner.address);
        return ownerAddress === normalizedAccount;
      });

      let quantityOwned: number | undefined;

      if (ownerEntry) {
        const quantityOwnedRaw = ownerEntry.quantity ?? 0;
        const parsedQuantityOwned = Number(quantityOwnedRaw);

        if (!Number.isFinite(parsedQuantityOwned) || parsedQuantityOwned <= 0) {
          continue;
        }

        quantityOwned = parsedQuantityOwned;
      } else {
        const mintedQuantity = mintedTokenQuantities.get(nft.identifier);

        if (
          typeof mintedQuantity === "number" &&
          Number.isFinite(mintedQuantity) &&
          mintedQuantity > 0
        ) {
          quantityOwned = mintedQuantity;
        }
      }

      if (
        typeof quantityOwned !== "number" ||
        !Number.isFinite(quantityOwned) ||
        quantityOwned <= 0
      ) {
        try {
          const fallbackNftResponse = await client.api.getNFT(
            nft.contract,
            nft.identifier,
            Chain.Base,
          );

          const fallbackNft = fallbackNftResponse?.nft;
          const fallbackOwners = fallbackNft?.owners ?? [];

          const fallbackOwnerEntry = fallbackOwners.find((owner) => {
            const ownerAddress = normalizeAddress(owner.address);
            return ownerAddress === normalizedAccount;
          });

          if (!fallbackOwnerEntry) {
            console.warn(
              `Owner entry missing for BasePaint token ${nft.identifier} even after fallback`,
              {
                normalizedAccount,
                fallbackOwners,
                fallbackNft,
              },
            );
            continue;
          }

          const fallbackQuantityOwnedRaw = fallbackOwnerEntry.quantity ?? 0;
          const parsedFallbackQuantityOwned = Number(fallbackQuantityOwnedRaw);

          if (
            !Number.isFinite(parsedFallbackQuantityOwned) ||
            parsedFallbackQuantityOwned <= 0
          ) {
            console.warn(
              `Invalid fallback quantity for BasePaint token ${nft.identifier}`,
              {
                fallbackQuantityOwnedRaw,
                parsedFallbackQuantityOwned,
              },
            );
            continue;
          }

          quantityOwned = parsedFallbackQuantityOwned;
        } catch (fallbackError) {
          console.error(
            `Failed to fetch fallback NFT data for BasePaint token ${nft.identifier}:`,
            fallbackError,
          );
          continue;
        }
      }

      try {
        await client.createListing({
          asset: {
            tokenAddress: BASEPAINT_CONTRACT_ADDRESS,
            tokenId: nft.identifier,
            tokenStandard: TokenStandard.ERC1155,
          },
          accountAddress: normalizedAccount,
          startAmount: LISTING_PRICE_ETH,
          quantity: quantityOwned,
          expirationTime,
        });
        processedTokenIds.add(nft.identifier);
      } catch (error) {
        console.error(`Failed to list BasePaint token ${nft.identifier}:`, error);
        failedTokenIds.push(nft.identifier);
      }
    }

    cursor = response.next || undefined;
  } while (cursor);

  if (failedTokenIds.length > 0) {
    throw new Error(
      `Failed to list BasePaint NFTs: ${failedTokenIds.join(", ")}`,
    );
  }
};

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }

    if (!process.env.TRADER_BOT_PK) {
      throw new Error("TRADER_BOT_PK is not configured");
    }

    const provider = getProvider();
    const signer = new Wallet(process.env.TRADER_BOT_PK, provider);
    const rewardsContract = new Contract(
      BASEPAINT_REWARDS_ADDRESS,
      BasePaintRewardsAbi,
      signer,
    );

    const recipient = await signer.getAddress();
    const mintCost = MINT_PRICE_WEI * MINT_COUNT;

    const tx = await rewardsContract.mintLatest(
      recipient,
      MINT_COUNT,
      REFERRER_ADDRESS,
      {
        value: mintCost,
      },
    );

    const receipt = await tx.wait();

    const openSeaClient = getOpenSeaClient(signer);
    const mintedTokenQuantities = getMintedTokenQuantitiesFromReceipt(
      receipt,
      recipient,
    );
    await listAllBasePaintNftsForSale(
      openSeaClient,
      recipient,
      mintedTokenQuantities,
    );

    return new Response("BasePaint minted successfully", {
      status: 200,
    });
  } catch (error) {
    console.error("Error minting or listing BasePaint:", error);
    return new Response("Internal Server Error", {
      status: 500,
    });
  }
}
