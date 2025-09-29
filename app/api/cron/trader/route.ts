import { BasePaintRewardsAbi } from "@/app/lib/abi/BasePaintRewards.abi";
import { baseRpcUrl } from "@/app/lib/Web3Configs";
import { Contract, JsonRpcProvider, Wallet } from "ethers";
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

const normalizedBasePaintAddress = BASEPAINT_CONTRACT_ADDRESS.toLowerCase();

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

const listAllBasePaintNftsForSale = async (
  client: OpenSeaSDK,
  accountAddress: string,
) => {
  const normalizedAccount = accountAddress.toLowerCase();
  const expirationTime = Math.floor(Date.now() / 1000) + LISTING_DURATION_SECONDS;
  let cursor: string | undefined;
  const failedTokenIds: string[] = [];
  const processedTokenIds = new Set<string>();

  do {
    const response = await client.api.getNFTsByAccount(
      accountAddress,
      NFT_PAGE_SIZE,
      cursor,
      Chain.Base,
    );

    const nfts = response?.nfts ?? [];

    for (const nft of nfts) {
      if (nft.contract.toLowerCase() !== normalizedBasePaintAddress) {
        continue;
      }

      if (processedTokenIds.has(nft.identifier)) {
        continue;
      }

      const ownerEntry = nft.owners.find(
        (owner) => owner.address.toLowerCase() === normalizedAccount,
      );

      if (!ownerEntry || ownerEntry.quantity <= 0) {
        continue;
      }

      try {
        await client.createListing({
          asset: {
            tokenAddress: BASEPAINT_CONTRACT_ADDRESS,
            tokenId: nft.identifier,
            tokenStandard: TokenStandard.ERC1155,
          },
          accountAddress,
          startAmount: LISTING_PRICE_ETH,
          quantity: ownerEntry.quantity,
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

    await tx.wait();

    const openSeaClient = getOpenSeaClient(signer);
    await listAllBasePaintNftsForSale(openSeaClient, recipient);

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
