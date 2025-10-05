import { BasePaintRewardsAbi } from "@/app/lib/abi/BasePaintRewards.abi";
import { baseRpcUrl } from "@/app/lib/Web3Configs";
import {
  Contract,
  Interface,
  JsonRpcProvider,
  Log,
  Wallet,
  ZeroAddress,
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
const zeroAddress = getAddress(ZeroAddress);
const erc1155Interface = new Interface([
  "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
  "event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)",
]);

const getListingExpirationTime = () =>
  Math.floor(Date.now() / 1000) + LISTING_DURATION_SECONDS;

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

const extractMintedTokenQuantities = (logs: Iterable<Log>, recipient: string) => {
  const mintedTokenQuantities = new Map<string, bigint>();
  const normalizedRecipient = normalizeAddress(recipient);

  if (!normalizedRecipient) {
    return mintedTokenQuantities;
  }

  for (const log of logs) {
    const logAddress = normalizeAddress(log?.address);

    if (logAddress !== checksummedBasePaintAddress) {
      continue;
    }

    let parsedLog;

    try {
      parsedLog = erc1155Interface.parseLog(log);
    } catch (error) {
      continue;
    }

    const from = normalizeAddress(parsedLog.args?.from);
    const to = normalizeAddress(parsedLog.args?.to);

    if (from !== zeroAddress || to !== normalizedRecipient) {
      continue;
    }

    if (parsedLog.name === "TransferSingle") {
      const tokenId = parsedLog.args?.id;
      const value = parsedLog.args?.value;

      if (tokenId == null || value == null) {
        continue;
      }

      const tokenIdString = tokenId.toString();
      const quantity = BigInt(value.toString());

      if (quantity <= 0n) {
        continue;
      }

      const existingQuantity = mintedTokenQuantities.get(tokenIdString) ?? 0n;
      mintedTokenQuantities.set(tokenIdString, existingQuantity + quantity);
    }

    if (parsedLog.name === "TransferBatch") {
      const tokenIds = (parsedLog.args?.ids ?? []) as readonly (
        bigint | number | string
      )[];
      const quantities = (parsedLog.args?.values ?? []) as readonly (
        bigint | number | string
      )[];

      tokenIds.forEach((tokenId, index) => {
        const quantityRaw = quantities[index];

        if (quantityRaw == null) {
          return;
        }

        const quantity = BigInt(quantityRaw.toString());

        if (quantity <= 0n) {
          return;
        }

        const tokenIdString = tokenId.toString();
        const existingQuantity = mintedTokenQuantities.get(tokenIdString) ?? 0n;
        mintedTokenQuantities.set(tokenIdString, existingQuantity + quantity);
      });
    }
  }

  return mintedTokenQuantities;
};

const listAllBasePaintNftsForSale = async (
  client: OpenSeaSDK,
  accountAddress: string,
  processedTokenIds: Set<string>,
  expirationTime: number,
) => {
  const normalizedAccount = normalizeAddress(accountAddress);

  if (!normalizedAccount) {
    throw new Error("Invalid account address provided");
  }
  let cursor: string | undefined;
  const failedTokenIds: string[] = [];

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

      if (!ownerEntry) {
        continue;
      }

      const quantityOwnedRaw = ownerEntry.quantity ?? 0;
      const quantityOwned = Number(quantityOwnedRaw);

      if (!Number.isFinite(quantityOwned) || quantityOwned <= 0) {
        continue;
      }

      try {
        console.info(
          `Listing BasePaint token ${nft.identifier} with quantity ${quantityOwned}`,
        );
        await client.createListing({
          asset: {
            tokenAddress: BASEPAINT_CONTRACT_ADDRESS,
            tokenId: nft.identifier,
            tokenStandard: TokenStandard.ERC1155,
          },
          accountAddress: normalizedAccount,
          startAmount: LISTING_PRICE_ETH,
          quantity: quantityOwned.toString(),
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

const listMintedBasePaintNftsForSale = async (
  client: OpenSeaSDK,
  accountAddress: string,
  mintedTokenQuantities: Map<string, bigint>,
  processedTokenIds: Set<string>,
  expirationTime: number,
) => {
  if (mintedTokenQuantities.size === 0) {
    console.info("No newly minted BasePaint tokens detected in transaction receipt");
    return;
  }

  const normalizedAccount = normalizeAddress(accountAddress);

  if (!normalizedAccount) {
    throw new Error("Invalid account address provided");
  }

  const failedTokenIds: string[] = [];

  for (const [tokenId, quantity] of mintedTokenQuantities) {
    if (processedTokenIds.has(tokenId)) {
      continue;
    }

    const quantityString = quantity.toString();

    if (quantity <= 0n) {
      continue;
    }

    try {
      console.info(
        `Listing newly minted BasePaint token ${tokenId} with quantity ${quantityString}`,
      );
      await client.createListing({
        asset: {
          tokenAddress: BASEPAINT_CONTRACT_ADDRESS,
          tokenId,
          tokenStandard: TokenStandard.ERC1155,
        },
        accountAddress: normalizedAccount,
        startAmount: LISTING_PRICE_ETH,
        quantity: quantityString,
        expirationTime,
      });
      processedTokenIds.add(tokenId);
    } catch (error) {
      console.error(
        `Failed to list newly minted BasePaint token ${tokenId}:`,
        error,
      );
      failedTokenIds.push(tokenId);
    }
  }

  if (failedTokenIds.length > 0) {
    throw new Error(
      `Failed to list newly minted BasePaint NFTs: ${failedTokenIds.join(", ")}`,
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
    const mintedTokenQuantities = extractMintedTokenQuantities(
      receipt.logs,
      recipient,
    );
    const processedTokenIds = new Set<string>();
    const expirationTime = getListingExpirationTime();

    if (mintedTokenQuantities.size > 0) {
      console.info(
        "Detected newly minted BasePaint tokens",
        Array.from(mintedTokenQuantities.entries()).map(
          ([tokenId, quantity]) => ({
            tokenId,
            quantity: quantity.toString(),
          }),
        ),
      );
    }

    await listAllBasePaintNftsForSale(
      openSeaClient,
      recipient,
      processedTokenIds,
      expirationTime,
    );
    await listMintedBasePaintNftsForSale(
      openSeaClient,
      recipient,
      mintedTokenQuantities,
      processedTokenIds,
      expirationTime,
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
