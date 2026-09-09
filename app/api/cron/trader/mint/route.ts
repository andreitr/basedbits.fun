import { BasePaintRewardsAbi } from "@/app/lib/abi/BasePaintRewards.abi";
import { swapEthForBbits } from "@/app/lib/contracts/bbitsVault";
import { baseProvider } from "@/app/lib/Web3Configs";
import { Contract, Wallet, formatEther } from "ethers";
import { NextRequest } from "next/server";

const BASEPAINT_REWARDS_ADDRESS = "0xaff1A9E200000061fC3283455d8B0C7e3e728161";
const REFERRER_ADDRESS = "0xDAdA5bAd8cdcB9e323d0606d081E6Dc5D3a577a1";
const MINT_COUNT = 6;
const MINT_PRICE_WEI = 2_600_000_000_000_000; // 0.0026 ETH per mint

// After a successful mint, every wei of native ETH above this reserve is treated as
// profit from earlier OpenSea sales and swapped into BBITS. The reserve is deliberately
// gas-only (~$0.10): tomorrow's mint budget is expected to arrive from today's sales.
// If it hasn't, tomorrow's mint reverts before this step runs, nothing is swapped, and
// ETH accumulates until a mint succeeds.
const GAS_RESERVE_WEI = BigInt("30000000000000"); // 0.00003 ETH — gas for the next mint tx
const MIN_SWAP_WEI = BigInt("100000000000000"); // 0.0001 ETH — below this a swap isn't worth a tx

// Gas the swap itself burns (wrap + single-hop swap), priced at the current fee so the
// reserve above is still intact once the swap has been paid for.
const SWAP_GAS_UNITS = BigInt(200_000);

export const dynamic = "force-dynamic";

type SwapResult =
  | null
  | {
      ok: true;
      txHash: string;
      amountInWei: string;
      quotedOutWei: string;
      amountOutMinimumWei: string;
    }
  | { ok: false; error: string };

/**
 * Swap the wallet's excess native ETH into BBITS. Never throws: a failed swap must not
 * turn a successful mint into a 500, so errors are reported in the result instead.
 */
const sweepProfitIntoBbits = async (
  signer: Wallet,
  bot: string,
): Promise<SwapResult> => {
  try {
    const [balance, feeData] = await Promise.all([
      baseProvider.getBalance(bot),
      baseProvider.getFeeData(),
    ]);
    const swapGasWei = (feeData.maxFeePerGas ?? BigInt(0)) * SWAP_GAS_UNITS;
    const excess = balance - GAS_RESERVE_WEI - swapGasWei;
    if (excess < MIN_SWAP_WEI) {
      console.log(
        `Balance ${formatEther(balance)} ETH leaves ${excess > BigInt(0) ? formatEther(excess) : "0"} ETH above the gas reserve — below the ${formatEther(MIN_SWAP_WEI)} ETH swap floor, holding`,
      );
      return null;
    }

    const swap = await swapEthForBbits(signer, excess);
    console.log(
      `Swapped ${formatEther(swap.amountInWei)} ETH for ~${formatEther(swap.quotedOutWei)} BBITS (min ${formatEther(swap.amountOutMinimumWei)}) in ${swap.txHash}`,
    );
    return {
      ok: true,
      txHash: swap.txHash,
      amountInWei: swap.amountInWei.toString(),
      quotedOutWei: swap.quotedOutWei.toString(),
      amountOutMinimumWei: swap.amountOutMinimumWei.toString(),
    };
  } catch (error) {
    console.error("Error swapping profit ETH into BBITS:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
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

    const signer = new Wallet(process.env.TRADER_BOT_PK, baseProvider);
    const rewardsContract = new Contract(
      BASEPAINT_REWARDS_ADDRESS,
      BasePaintRewardsAbi,
      signer,
    );

    const recipient = await signer.getAddress();
    const mintCost = BigInt(MINT_PRICE_WEI) * BigInt(MINT_COUNT);

    const tx = await rewardsContract.mintLatest(
      recipient,
      MINT_COUNT,
      REFERRER_ADDRESS,
      {
        value: mintCost,
      },
    );

    await tx.wait();
    console.log(`Minted ${MINT_COUNT} BasePaint NFTs in ${tx.hash}`);

    // Same signer, strictly after the mint confirmed: no nonce race, and the swap only
    // ever runs once the day's spend has already left the wallet.
    const swap = await sweepProfitIntoBbits(signer, recipient);

    return Response.json({
      ok: true,
      bot: recipient,
      mintTx: tx.hash,
      minted: MINT_COUNT,
      swap,
    });
  } catch (error) {
    console.error("Error minting BasePaint NFTs:", error);
    return new Response("Internal Server Error", {
      status: 500,
    });
  }
}
