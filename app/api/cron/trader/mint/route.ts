import { BasePaintRewardsAbi } from "@/app/lib/abi/BasePaintRewards.abi";
import {
  getQuoter,
  minOutWithSlippage,
  quoteBbitsForWeth,
  sendEthForBbitsSwap,
} from "@/app/lib/contracts/bbitsVault";
import { TimeoutError, withTimeout } from "@/app/lib/utils/asyncUtils";
import { createBaseProvider } from "@/app/lib/Web3Configs";
import {
  Contract,
  ContractTransactionResponse,
  JsonRpcProvider,
  Wallet,
  formatEther,
  formatUnits,
  isError,
} from "ethers";
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
const SWAP_SLIPPAGE_BPS = BigInt(100); // 1% between the quote and the fill

// Time budgets. Every await below is bounded so a hung RPC call or a broadcast-but-
// never-mined tx can't pin the function to Vercel's 300 s limit (which is exactly what
// happened on 2026-09-11: mint confirmed, then silence until the platform killed us).
// Worst case ≈ nonce check 10 s + mint send path ~50 s + mint wait 90 s + sweep 120 s.
const RPC_TIMEOUT_MS = 10_000; // per HTTP request; Alchemy answers in well under 1 s
const MINT_WAIT_TIMEOUT_MS = 90_000; // 2 s blocks, 4-10 s typical; absorbs a sequencer hiccup
const SWAP_WAIT_TIMEOUT_MS = 60_000; // the sweep is best-effort, so shorter
const SWEEP_BUDGET_MS = 120_000; // outer bound on reads + quote + send + wait together

export const dynamic = "force-dynamic";

type SweepStage = "read-balance" | "quote" | "send" | "wait";

type SwapResult =
  | null // below the swap floor, nothing sent
  | {
      ok: true;
      status: "confirmed";
      txHash: string;
      amountInWei: string;
      quotedOutWei: string;
      amountOutMinimumWei: string;
      gasUsed: string;
    }
  | {
      ok: false;
      status: "unconfirmed"; // broadcast, but not mined within budget — nonce stays occupied
      txHash: string;
      amountInWei: string;
      quotedOutWei: string;
      amountOutMinimumWei: string;
      error: string;
    }
  | { ok: false; status: "reverted"; txHash: string; error: string }
  | { ok: false; status: "failed"; stage: SweepStage; error: string };

// Mutated before every await in runSweep so that whatever throws — including a timeout
// raised deep inside ethers' send path — is attributed to the step that was running.
type SweepProgress = {
  stage: SweepStage;
  txHash?: string;
  nonce?: number;
  amountInWei?: bigint;
  quotedOutWei?: bigint;
  amountOutMinimumWei?: bigint;
};

const runSweep = async (
  signer: Wallet,
  provider: JsonRpcProvider,
  bot: string,
  progress: SweepProgress,
): Promise<SwapResult> => {
  progress.stage = "read-balance";
  // Two reads in one JSON-RPC batch, so a single RPC_TIMEOUT_MS covers both.
  const [balance, feeData] = await Promise.all([
    provider.getBalance(bot),
    provider.getFeeData(),
  ]);
  const maxFeePerGas = feeData.maxFeePerGas ?? BigInt(0);
  const swapGasWei = maxFeePerGas * SWAP_GAS_UNITS;
  const excess = balance - GAS_RESERVE_WEI - swapGasWei;
  console.log(
    `Sweep: balance ${formatEther(balance)} ETH, maxFeePerGas ${formatUnits(maxFeePerGas, "gwei")} gwei, swap gas ${formatEther(swapGasWei)} ETH, excess ${excess > BigInt(0) ? formatEther(excess) : "0"} ETH`,
  );
  if (excess < MIN_SWAP_WEI) {
    console.log(
      `Sweep: below the ${formatEther(MIN_SWAP_WEI)} ETH swap floor, holding`,
    );
    return null;
  }

  progress.stage = "quote";
  progress.amountInWei = excess;
  const quotedOutWei = await quoteBbitsForWeth(getQuoter(provider), excess);
  const amountOutMinimumWei = minOutWithSlippage(
    quotedOutWei,
    SWAP_SLIPPAGE_BPS,
  );
  progress.quotedOutWei = quotedOutWei;
  progress.amountOutMinimumWei = amountOutMinimumWei;
  console.log(
    `Sweep: quote ${formatEther(excess)} ETH -> ~${formatEther(quotedOutWei)} BBITS (min ${formatEther(amountOutMinimumWei)} at ${SWAP_SLIPPAGE_BPS} bps slippage)`,
  );

  progress.stage = "send";
  const tx = await sendEthForBbitsSwap(signer, excess, amountOutMinimumWei);
  progress.txHash = tx.hash;
  progress.nonce = tx.nonce;
  console.log(
    `Sweep: swap tx sent ${tx.hash} (nonce ${tx.nonce}), waiting up to ${SWAP_WAIT_TIMEOUT_MS} ms`,
  );

  progress.stage = "wait";
  const receipt = await tx.wait(1, SWAP_WAIT_TIMEOUT_MS);
  if (!receipt) {
    throw new Error(`No receipt returned for swap ${tx.hash}`);
  }
  console.log(
    `Swapped ${formatEther(excess)} ETH for ~${formatEther(quotedOutWei)} BBITS (min ${formatEther(amountOutMinimumWei)}) in ${tx.hash}, gasUsed ${receipt.gasUsed}`,
  );
  return {
    ok: true,
    status: "confirmed",
    txHash: tx.hash,
    amountInWei: excess.toString(),
    quotedOutWei: quotedOutWei.toString(),
    amountOutMinimumWei: amountOutMinimumWei.toString(),
    gasUsed: receipt.gasUsed.toString(),
  };
};

const classifySweepError = (
  error: unknown,
  progress: SweepProgress,
): SwapResult => {
  const message = error instanceof Error ? error.message : String(error);
  // Both our outer budget and ethers' request/wait timeouts surface as timeouts, so the
  // distinction that matters is whether a tx had already been broadcast.
  const timedOut =
    error instanceof TimeoutError || isError(error, "TIMEOUT");

  if (progress.txHash && timedOut) {
    console.error(
      `Sweep: swap ${progress.txHash} (nonce ${progress.nonce}) sent but NOT confirmed within budget; the nonce stays occupied until it lands or is replaced: ${message}`,
    );
    return {
      ok: false,
      status: "unconfirmed",
      txHash: progress.txHash,
      amountInWei: (progress.amountInWei ?? BigInt(0)).toString(),
      quotedOutWei: (progress.quotedOutWei ?? BigInt(0)).toString(),
      amountOutMinimumWei: (progress.amountOutMinimumWei ?? BigInt(0)).toString(),
      error: message,
    };
  }

  if (progress.txHash && isError(error, "CALL_EXCEPTION")) {
    console.error(`Sweep: swap ${progress.txHash} reverted on-chain: ${message}`);
    return {
      ok: false,
      status: "reverted",
      txHash: progress.txHash,
      error: message,
    };
  }

  console.error(`Sweep failed at stage "${progress.stage}": ${message}`);
  return { ok: false, status: "failed", stage: progress.stage, error: message };
};

/**
 * Swap the wallet's excess native ETH into BBITS. Never throws and never outlives
 * SWEEP_BUDGET_MS: a failed or slow swap must not turn a successful mint into a 500 or
 * a platform timeout, so problems are reported in the result instead.
 */
const sweepProfitIntoBbits = async (
  signer: Wallet,
  provider: JsonRpcProvider,
  bot: string,
): Promise<SwapResult> => {
  const progress: SweepProgress = { stage: "read-balance" };
  try {
    return await withTimeout(
      runSweep(signer, provider, bot, progress),
      SWEEP_BUDGET_MS,
      "sweep",
    );
  } catch (error) {
    return classifySweepError(error, progress);
  }
};

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  // One provider per invocation: every request it makes is bounded, and destroying it
  // in `finally` stops any receipt polling that would otherwise outlive the response.
  const provider = createBaseProvider({ requestTimeoutMs: RPC_TIMEOUT_MS });

  try {
    if (!process.env.TRADER_BOT_PK) {
      throw new Error("TRADER_BOT_PK is not configured");
    }

    const signer = new Wallet(process.env.TRADER_BOT_PK, provider);
    const recipient = await signer.getAddress();

    // A tx from a previous run that never mined (e.g. yesterday's swap) still holds the
    // next nonce. Minting now would queue behind it and stall exactly the same way, so
    // skip and say so; clearing it is a manual replace/cancel from the bot wallet.
    const [nonceLatest, noncePending] = await Promise.all([
      provider.getTransactionCount(recipient, "latest"),
      provider.getTransactionCount(recipient, "pending"),
    ]);
    console.log(
      `Nonce check for ${recipient}: latest ${nonceLatest}, pending ${noncePending}`,
    );
    if (noncePending > nonceLatest) {
      console.error(
        `Skipping mint: ${noncePending - nonceLatest} unconfirmed tx(s) from ${recipient} occupy nonce(s) ${nonceLatest}..${noncePending - 1}. A new mint would queue behind them. Inspect https://basescan.org/address/${recipient} and cancel/replace manually.`,
      );
      // 200 by convention: an expected, handled state, not an unexpected throw. Switch
      // to 503 if the Vercel cron dashboard's non-2xx flagging is wanted for this.
      return Response.json({
        ok: false,
        skipped: "pending_nonce",
        bot: recipient,
        nonceLatest,
        noncePending,
      });
    }

    const rewardsContract = new Contract(
      BASEPAINT_REWARDS_ADDRESS,
      BasePaintRewardsAbi,
      signer,
    );
    const mintCost = BigInt(MINT_PRICE_WEI) * BigInt(MINT_COUNT);

    const tx: ContractTransactionResponse = await rewardsContract.mintLatest(
      recipient,
      MINT_COUNT,
      REFERRER_ADDRESS,
      {
        value: mintCost,
      },
    );
    console.log(`Mint tx sent: ${tx.hash} (nonce ${tx.nonce})`);

    try {
      await tx.wait(1, MINT_WAIT_TIMEOUT_MS);
    } catch (error) {
      if (isError(error, "TIMEOUT")) {
        // Don't sweep on an unconfirmed mint: a balance read before it lands would
        // treat tomorrow's mint budget as profit.
        console.error(
          `Mint ${tx.hash} (nonce ${tx.nonce}) not confirmed after ${MINT_WAIT_TIMEOUT_MS} ms; skipping sweep`,
        );
        return Response.json({
          ok: false,
          bot: recipient,
          mintTx: tx.hash,
          mintStatus: "unconfirmed",
          minted: 0,
          swap: null,
        });
      }
      throw error;
    }
    console.log(`Minted ${MINT_COUNT} BasePaint NFTs in ${tx.hash}`);

    // Same signer, strictly after the mint confirmed: no nonce race, and the swap only
    // ever runs once the day's spend has already left the wallet.
    const swap = await sweepProfitIntoBbits(signer, provider, recipient);

    return Response.json({
      ok: true,
      bot: recipient,
      mintTx: tx.hash,
      mintStatus: "confirmed",
      minted: MINT_COUNT,
      swap,
    });
  } catch (error) {
    console.error("Error minting BasePaint NFTs:", error);
    return new Response("Internal Server Error", {
      status: 500,
    });
  } finally {
    provider.destroy();
  }
}
