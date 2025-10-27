import { baseRpcUrl } from "@/app/lib/Web3Configs";
import { Contract, JsonRpcProvider, Wallet, getAddress } from "ethers";
import { NextRequest } from "next/server";
import { Chain, OpenSeaSDK, TokenStandard } from "opensea-js";

// ERC1155 ABI for balance checking
const ERC1155_ABI = [
  "function balanceOf(address account, uint256 id) view returns (uint256)"
];

const BASEPAINT_CONTRACT_ADDRESS = "0xBa5e05cb26b78eDa3A2f8e3b3814726305dcAc83";
const LISTING_PRICE_ETH = 0.00269;
const LISTING_DURATION_SECONDS = 30 * 24 * 60 * 60; // 30 days

const checksummedBasePaintAddress = getAddress(BASEPAINT_CONTRACT_ADDRESS);

const getProvider = () => new JsonRpcProvider(baseRpcUrl);

const checkTokenOwnership = async (
  tokenId: string,
  ownerAddress: string,
): Promise<number> => {
  try {
    const provider = getProvider();
    const contract = new Contract(BASEPAINT_CONTRACT_ADDRESS, ERC1155_ABI, provider);
    const balance = await contract.balanceOf(ownerAddress, tokenId);
    return Number(balance);
  } catch (error) {
    console.error(`Failed to check ownership for token ${tokenId}:`, error);
    return 0;
  }
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
  const normalizedAccount = getAddress(accountAddress);
  const expirationTime = Math.floor(Date.now() / 1000) + LISTING_DURATION_SECONDS;

  // Get all NFTs for the account
  const response = await client.api.getNFTsByAccount(
    normalizedAccount,
    50, // Reasonable page size
    undefined, // No cursor needed for recent mints
    Chain.Base,
  );

  const nfts = response?.nfts ?? [];
  let listedCount = 0;

  for (const nft of nfts) {
    // Only process BasePaint NFTs
    if (getAddress(nft.contract) !== checksummedBasePaintAddress) {
      continue;
    }

    // Check ownership directly from blockchain (most reliable)
    const quantityOwned = await checkTokenOwnership(nft.identifier, normalizedAccount);
    
    if (quantityOwned <= 0) {
      console.log(`No ownership found for token ${nft.identifier}, skipping`);
      continue;
    }

    try {
      await client.createListing({
        asset: {
          tokenAddress: BASEPAINT_CONTRACT_ADDRESS,
          tokenId: nft.identifier,
          tokenStandard: TokenStandard.ERC1155,
        },
        accountAddress: normalizedAccount,
        // Ensure per-unit price is 0.00269 ETH for ERC1155 quantity listings
        startAmount: LISTING_PRICE_ETH * Math.max(1, Number(quantityOwned)),
        quantity: quantityOwned,
        expirationTime,
        paymentTokenAddress: "0x0000000000000000000000000000000000000000", // ETH
      });
      
      console.log(`Successfully listed token ${nft.identifier} (quantity: ${quantityOwned})`);
      listedCount++;
    } catch (error) {
      console.error(`Failed to list token ${nft.identifier}:`, error);
    }
  }

  console.log(`Listed ${listedCount} BasePaint NFTs`);
};

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (!process.env.TRADER_BOT_PK) {
      throw new Error("TRADER_BOT_PK is not configured");
    }

    if (!process.env.OPENSEA_API_KEY) {
      throw new Error("OPENSEA_API_KEY is not configured");
    }

    const provider = getProvider();
    const signer = new Wallet(process.env.TRADER_BOT_PK, provider);
    const recipient = await signer.getAddress();

    console.log(`Starting to list BasePaint NFTs for ${recipient}...`);

    const openSeaClient = getOpenSeaClient(signer);
    await listAllBasePaintNftsForSale(openSeaClient, recipient);

    return new Response("BasePaint NFTs listed successfully", { status: 200 });
  } catch (error) {
    console.error("Error listing BasePaint NFTs:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}