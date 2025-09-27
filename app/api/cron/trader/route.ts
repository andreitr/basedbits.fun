import { BasePaintRewardsAbi } from "@/app/lib/abi/BasePaintRewards.abi";
import { baseRpcUrl } from "@/app/lib/Web3Configs";
import { Contract, JsonRpcProvider, Wallet } from "ethers";
import { NextRequest } from "next/server";

const BASEPAINT_REWARDS_ADDRESS = "0xaff1A9E200000061fC3283455d8B0C7e3e728161";
const REFERRER_ADDRESS = "0xDAdA5bAd8cdcB9e323d0606d081E6Dc5D3a577a1";
const MINT_COUNT = 3n;
const MINT_PRICE_WEI = 2600000000000000n; // 0.0026 ETH per mint

let provider: JsonRpcProvider | null = null;

const getProvider = () => {
  if (!provider) {
    provider = new JsonRpcProvider(baseRpcUrl);
  }

  return provider;
};

export const dynamic = "force-dynamic";

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

    return new Response("BasePaint minted successfully", {
      status: 200,
    });
  } catch (error) {
    console.error("Error minting BasePaint:", error);
    return new Response("Internal Server Error", {
      status: 500,
    });
  }
}
