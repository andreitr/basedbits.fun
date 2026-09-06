import {
  BBITS_COLLECTION,
  BBITS_VAULT,
  COLLECTION_SLUG,
  POOL_FEE,
  SWAP_ROUTER_02_ADDRESS,
  WETH_ADDRESS,
  getBbitsArbKeeper,
  quoteBbitsForExactWeth,
  quoteParityWei,
  quoteWethForBbits,
} from "@/app/lib/contracts/bbitsVault";
import {
  Contract,
  ContractRunner,
  MaxUint256,
  Wallet,
  formatEther,
  getAddress,
} from "ethers";
import { NextRequest } from "next/server";
import {
  Chain,
  OpenSeaSDK,
  OrderSide,
  OrderType,
  type OrderV2,
} from "opensea-js";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// --- Strategy constants -----------------------------------------------------
// All figures are wei of ETH/WETH. Parity is ~0.00248 ETH per NFT at time of writing.

const TARGET_MARGIN_WEI = BigInt("200000000000000"); // 0.0002 ETH — ~8% of parity
const GAS_BUFFER_WEI = BigInt("40000000000000"); // 0.00004 ETH — floor; see effectiveGasBuffer()
const REPRICE_THRESHOLD_WEI = GAS_BUFFER_WEI; // don't churn for sub-gas drift
const MAX_SPEND_WEI = BigInt("3000000000000000"); // 0.003 ETH — one NFT

// The seeded WETH balance the bot returns to after every fill. This doubles as the
// profit/float boundary: BBITS left over once WETH is back at target is banked margin.
const TARGET_WETH_FLOAT_WEI = BigInt("3000000000000000"); // 0.003 ETH

const MIN_BBITS_RESERVE = BigInt(0); // optional floor protecting banked profit
const SLIPPAGE_BPS = BigInt(100); // 1% on the exit swap
const ESTIMATED_GAS = BigInt(600_000); // fulfill + approve + exchange + swap

// Guard against a corrupted price read — the one failure that can overbid real money.
const SANITY_PARITY_WEI = BigInt("2481770469241832"); // observed parity
const SANITY_BAND_BPS = BigInt(5_000); // accept +/- 50%

// Short expiry so a dead cron leaves no stale bid resting at a price that has drifted.
const OFFER_DURATION_SECONDS = 60 * 60;

// Writes are disabled unless BBITS_ARB_DRY_RUN is explicitly "0".
const isDryRun = () => process.env.BBITS_ARB_DRY_RUN !== "0";

const SEAPORT_ABI = [
  "function getOrderStatus(bytes32 orderHash) view returns (bool isValidated, bool isCancelled, uint256 totalFilled, uint256 totalSize)",
] as const;

const getOpenSeaClient = (signer: Wallet) =>
  new OpenSeaSDK(signer, {
    chain: Chain.Base,
    apiKey: process.env.OPENSEA_API_KEY,
  });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parameters = (protocolData: any) => protocolData?.parameters;

const effectiveGasBuffer = async (provider: {
  getFeeData: () => Promise<{ maxFeePerGas: bigint | null }>;
}): Promise<bigint> => {
  try {
    const { maxFeePerGas } = await provider.getFeeData();
    const dynamic = (maxFeePerGas ?? BigInt(0)) * ESTIMATED_GAS;
    return dynamic > GAS_BUFFER_WEI ? dynamic : GAS_BUFFER_WEI;
  } catch {
    return GAS_BUFFER_WEI;
  }
};

/**
 * The bot's single resting collection offer, or null.
 *
 * The API returns cancelled and expired orders, and `assetContractAddress` filtering is
 * unreliable for criteria orders, so everything is re-checked in code against the
 * consideration item rather than trusted from the query.
 */
const findRestingOffer = async (client: OpenSeaSDK, maker: string) => {
  const { orders } = await client.api.getOrders({
    side: OrderSide.OFFER,
    protocol: "seaport",
    maker,
    orderBy: "created_date",
    orderDirection: "desc",
  });

  const nowSec = Math.floor(Date.now() / 1000);

  return orders.filter((order) => {
    if (order.orderType !== OrderType.CRITERIA) return false;
    if (order.cancelled || order.finalized || order.markedInvalid) return false;
    if (order.remainingQuantity <= 0) return false;
    if (order.expirationTime <= nowSec) return false;

    const consideration = parameters(order.protocolData)?.consideration ?? [];
    const target = consideration[0]?.token;
    return !!target && getAddress(target) === getAddress(BBITS_COLLECTION);
  });
};

// The exact WETH the bot has committed, read off the Seaport offer item rather than
// `currentPrice`, which is a derived display value.
const restingOfferPriceWei = (order: { protocolData: unknown }): bigint =>
  BigInt(parameters(order.protocolData)?.offer?.[0]?.startAmount ?? 0);

/**
 * Cheapest genuinely fulfillable listing, priced by summing the Seaport consideration —
 * that sum, not the headline `price`, is what the buyer actually pays.
 */
const findBestFloor = async (client: OpenSeaSDK) => {
  const { listings } = await client.api.getBestListings(COLLECTION_SLUG, 20);
  const nowSec = Math.floor(Date.now() / 1000);

  const priced = (listings ?? []).flatMap((listing) => {
    const params = parameters(listing.protocol_data);
    const consideration = params?.consideration ?? [];
    if (!consideration.length) return [];

    // Expiring imminently — would likely revert between decision and fulfilment.
    if (Number(params.endTime ?? 0) <= nowSec + 120) return [];

    let total = BigInt(0);
    for (const item of consideration) {
      // Only NATIVE (0) and ERC20 (1) are payment items; anything else means this is
      // not a plain sale and the cost calculation would be wrong.
      const itemType = Number(item.itemType);
      if (itemType !== 0 && itemType !== 1) return [];
      if (
        itemType === 1 &&
        getAddress(item.token) !== getAddress(WETH_ADDRESS)
      ) {
        return [];
      }
      // Dutch auction: price is time-dependent, so a static total is meaningless.
      if (item.startAmount !== item.endAmount) return [];
      total += BigInt(item.startAmount);
    }

    if (total <= BigInt(0)) return [];
    return [{ listing, totalCostWei: total }];
  });

  priced.sort((a, b) => (a.totalCostWei < b.totalCostWei ? -1 : 1));
  return priced[0] ?? null;
};

/**
 * Token ids the bot holds but hasn't deposited yet — i.e. a bid filled, or a previous
 * run died between buying and depositing.
 *
 * The collection is an EIP-1167 proxy with no ERC721Enumerable, so ids come from
 * OpenSea's index; that index lags, so every candidate is re-confirmed with ownerOf.
 */
const collectStrayNfts = async (
  client: OpenSeaSDK,
  collection: Contract,
  bot: string,
): Promise<string[]> => {
  const heldCount: bigint = await collection.balanceOf(bot);
  if (heldCount <= BigInt(0)) return [];

  const response = await client.api.getNFTsByAccount(
    bot,
    50,
    undefined,
    Chain.Base,
  );
  const candidates = (response?.nfts ?? []).filter(
    (nft) => getAddress(nft.contract) === getAddress(BBITS_COLLECTION),
  );

  const owned: string[] = [];
  for (const nft of candidates) {
    try {
      const owner = await collection.ownerOf(nft.identifier);
      if (getAddress(owner) === getAddress(bot)) owned.push(nft.identifier);
    } catch {
      // Reindexed or transferred out from under us; skip.
    }
  }

  if (owned.length < Number(heldCount)) {
    console.log(
      `Holding ${heldCount} Based Bits but resolved ${owned.length} ids — OpenSea index lag, retrying next run`,
    );
  }
  return owned;
};

const ensureVaultApproval = async (collection: Contract, bot: string) => {
  if (await collection.isApprovedForAll(bot, BBITS_VAULT)) return;
  const tx = await collection.setApprovalForAll(BBITS_VAULT, true);
  await tx.wait();
};

const ensureSwapAllowance = async (
  vault: Contract,
  bot: string,
  needed: bigint,
) => {
  const allowance: bigint = await vault.allowance(bot, SWAP_ROUTER_02_ADDRESS);
  if (allowance >= needed) return;
  const tx = await vault.approve(SWAP_ROUTER_02_ADDRESS, MaxUint256);
  await tx.wait();
};

/**
 * Sell only as many BBITS as it takes to put the WETH balance back at its seeded target.
 * Whatever is left over is the realized margin and stays in the wallet as BBITS.
 */
const restoreWethFloat = async ({
  vault,
  quoter,
  swapRouter,
  bot,
  wethBalance,
  dryRun,
}: {
  vault: Contract;
  quoter: Contract;
  swapRouter: Contract;
  bot: string;
  wethBalance: bigint;
  dryRun: boolean;
}): Promise<string | null> => {
  const deficitWei = TARGET_WETH_FLOAT_WEI - wethBalance;
  const bbitsBalance: bigint = await vault.balanceOf(bot);
  const spendable =
    bbitsBalance > MIN_BBITS_RESERVE
      ? bbitsBalance - MIN_BBITS_RESERVE
      : BigInt(0);
  if (spendable <= BigInt(0)) return null;

  const needIn = await quoteBbitsForExactWeth(quoter, deficitWei);
  const amountInMaximum =
    (needIn * (BigInt(10_000) + SLIPPAGE_BPS)) / BigInt(10_000);

  if (amountInMaximum <= spendable) {
    if (dryRun)
      return `recover:swap-planned:${formatEther(amountInMaximum)}-bbits`;
    await ensureSwapAllowance(vault, bot, amountInMaximum);
    const tx = await swapRouter.exactOutputSingle({
      tokenIn: BBITS_VAULT,
      tokenOut: WETH_ADDRESS,
      fee: POOL_FEE,
      recipient: bot,
      amountOut: deficitWei,
      amountInMaximum,
      sqrtPriceLimitX96: 0,
    });
    await tx.wait();
    return "recover:float-restored";
  }

  // Parity fell below the cost basis — the float can't be fully restored without eating
  // into the reserve. Recover what we can so the bot stays funded, and log the shortfall.
  console.log(
    `Cannot fully restore WETH float: need ${formatEther(amountInMaximum)} BBITS, have ${formatEther(spendable)}`,
  );
  if (dryRun) return "recover:partial-swap-planned";

  const expectedOut = await quoteWethForBbits(quoter, spendable);
  const amountOutMinimum =
    (expectedOut * (BigInt(10_000) - SLIPPAGE_BPS)) / BigInt(10_000);
  await ensureSwapAllowance(vault, bot, spendable);
  const tx = await swapRouter.exactInputSingle({
    tokenIn: BBITS_VAULT,
    tokenOut: WETH_ADDRESS,
    fee: POOL_FEE,
    recipient: bot,
    amountIn: spendable,
    amountOutMinimum,
    sqrtPriceLimitX96: 0,
  });
  await tx.wait();
  return "recover:float-partial";
};

const offchainCancel = async (client: OpenSeaSDK, order: OrderV2) => {
  if (!order.orderHash) return;
  await client.offchainCancelOrder(
    order.protocolAddress,
    order.orderHash,
    Chain.Base,
    undefined,
    true, // derive the offerer signature from the bot's signer
  );
};

/**
 * `amount` here is in ETH UNITS, not wei: the SDK runs it through parseUnits(amount, 18)
 * internally. Passing wei would post an offer 1e18x too large.
 */
const postOffer = async (client: OpenSeaSDK, bot: string, bidWei: bigint) => {
  await client.createCollectionOffer({
    collectionSlug: COLLECTION_SLUG,
    accountAddress: bot,
    amount: formatEther(bidWei),
    quantity: 1,
    paymentTokenAddress: WETH_ADDRESS,
    expirationTime: Math.floor(Date.now() / 1000) + OFFER_DURATION_SECONDS,
    offerProtectionEnabled: true, // SignedZone — the precondition for gasless cancel
  });
};

// The SDK awaits its own confirmation, but that wrapper is soft. Read the canonical
// on-chain status before spending, using the order's own protocol address.
const confirmCancelled = async (
  provider: ContractRunner,
  order: OrderV2,
): Promise<boolean> => {
  if (!order.orderHash) return false;
  const seaport = new Contract(order.protocolAddress, SEAPORT_ABI, provider);
  const [, isCancelled] = await seaport.getOrderStatus(order.orderHash);
  return isCancelled === true;
};

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (!process.env.OPENSEA_API_KEY) {
      throw new Error("OPENSEA_API_KEY is not configured");
    }

    const dryRun = isDryRun();
    const keeper = getBbitsArbKeeper();
    const { signer, provider, vault, collection, weth, swapRouter, quoter } =
      keeper;
    const bot = await signer.getAddress();
    const client = getOpenSeaClient(signer);
    const actions: string[] = [];

    // --- Parity -------------------------------------------------------------
    const conversionRate: bigint = await vault.conversionRate();
    const parityWei = await quoteParityWei(quoter, conversionRate);

    const lower =
      (SANITY_PARITY_WEI * (BigInt(10_000) - SANITY_BAND_BPS)) / BigInt(10_000);
    const upper =
      (SANITY_PARITY_WEI * (BigInt(10_000) + SANITY_BAND_BPS)) / BigInt(10_000);
    if (parityWei < lower || parityWei > upper) {
      console.error(
        `Parity ${parityWei} outside sanity band [${lower}, ${upper}] — skipping run`,
      );
      return Response.json(
        {
          ok: false,
          action: "ABORT_PARITY_SANITY",
          parityWei: parityWei.toString(),
        },
        { status: 200 },
      );
    }

    const gasBufferWei = await effectiveGasBuffer(provider);
    const maxProfitablePriceWei = parityWei - TARGET_MARGIN_WEI - gasBufferWei;
    const bidWei =
      maxProfitablePriceWei < MAX_SPEND_WEI
        ? maxProfitablePriceWei
        : MAX_SPEND_WEI;

    if (maxProfitablePriceWei <= BigInt(0)) {
      return Response.json({
        ok: true,
        action: "HOLD",
        reason: "margin+gas exceeds parity",
        parityWei: parityWei.toString(),
      });
    }

    // --- Step 0: reconcile --------------------------------------------------
    // Every check derives from live on-chain balances, so a crash at any point
    // re-derives the same state on the next run.
    const strayNfts = await collectStrayNfts(client, collection, bot);
    if (strayNfts.length) {
      actions.push(`recover:deposit:${strayNfts.length}`);
      if (!dryRun) {
        await ensureVaultApproval(collection, bot);
        const tx = await vault.exchangeNFTsForTokens(strayNfts);
        await tx.wait();
      }
    }

    // The exit leg is triggered by a WETH float deficit, never by BBITS balance:
    // once margin banks up as BBITS, a balance trigger would eventually mistake
    // accumulated profit for an unprocessed deposit and sell it.
    //
    // It is additionally gated on holding no undeposited NFT. A bid can fill before
    // OpenSea indexes the transfer, which leaves the float short while the 1024 BBITS
    // that repays it doesn't exist yet — without this gate the shortfall would be
    // covered by selling previously banked margin instead. Wait for the deposit.
    const pendingNfts: bigint = await collection.balanceOf(bot);
    const wethBalance: bigint = await weth.balanceOf(bot);
    if (pendingNfts > BigInt(0)) {
      actions.push("recover:awaiting-deposit");
    } else if (wethBalance < TARGET_WETH_FLOAT_WEI) {
      const restored = await restoreWethFloat({
        vault,
        quoter,
        swapRouter,
        bot,
        wethBalance,
        dryRun,
      });
      if (restored) actions.push(restored);
    }

    // Re-read after reconcile: the float restore above may have topped this up, and a
    // stale value here would spuriously skip an affordable bid.
    const wethAvailable: bigint = await weth.balanceOf(bot);

    // --- Step 1: single-open-order invariant --------------------------------
    // A read failure must never fall through to "no open order -> bid": failing
    // closed is the only safe response when the orderbook is unknown.
    const restingOffers = await findRestingOffer(client, bot);

    if (restingOffers.length > 1) {
      actions.push(`recover:duplicate-offers:${restingOffers.length}`);
      if (!dryRun) {
        for (const stale of restingOffers.slice(1)) {
          await offchainCancel(client, stale);
        }
      }
    }
    const openOrder = restingOffers[0] ?? null;
    const openOrderPriceWei = openOrder
      ? restingOfferPriceWei(openOrder)
      : BigInt(0);

    // --- Step 2: decide -----------------------------------------------------
    const floor = await findBestFloor(client);
    const floorTotalWei = floor?.totalCostWei ?? null;

    let action: string;
    let reason = "";

    if (floorTotalWei !== null && floorTotalWei <= maxProfitablePriceWei) {
      action = "SWEEP";
      reason = "floor clears margin outright";
    } else if (!openOrder) {
      action = "BID";
      reason = "no resting offer";
    } else {
      const liveMarginWei = parityWei - openOrderPriceWei - gasBufferWei;
      if (liveMarginWei < TARGET_MARGIN_WEI - REPRICE_THRESHOLD_WEI) {
        action = "REPRICE_DOWN";
        reason = "margin eroded below target";
      } else if (liveMarginWei > TARGET_MARGIN_WEI + REPRICE_THRESHOLD_WEI) {
        action = "REPRICE_UP";
        reason = "offer stale below market";
      } else {
        action = "HOLD";
        reason = "within tolerance";
      }
    }

    const result = {
      ok: true,
      dryRun,
      action,
      reason,
      actions,
      bot,
      parityWei: parityWei.toString(),
      gasBufferWei: gasBufferWei.toString(),
      maxProfitablePriceWei: maxProfitablePriceWei.toString(),
      bidWei: bidWei.toString(),
      bidEth: formatEther(bidWei),
      floorTotalWei: floorTotalWei?.toString() ?? null,
      openOrderPriceWei: openOrder ? openOrderPriceWei.toString() : null,
      wethBalanceWei: wethAvailable.toString(),
      bbitsBalanceWei: (await vault.balanceOf(bot)).toString(),
    };

    if (dryRun) {
      console.log("bbits-arb dry run:", result);
      return Response.json(result);
    }

    // --- Step 3: execute ----------------------------------------------------
    if (action === "SWEEP" && floor) {
      // A resting bid must be hard-cancelled first: a seller could otherwise fill it
      // independently of this purchase, committing capital twice in one cycle.
      if (openOrder) {
        await client.cancelOrder({ order: openOrder, accountAddress: bot });
        const cancelled = await confirmCancelled(provider, openOrder);
        if (!cancelled) {
          console.error("On-chain cancel unconfirmed — aborting sweep");
          return Response.json({
            ...result,
            executed: "ABORT_CANCEL_UNCONFIRMED",
          });
        }
      }

      const nativeBalance = await provider.getBalance(bot);
      if (nativeBalance < floor.totalCostWei + gasBufferWei) {
        console.error("Insufficient native ETH to sweep");
        return Response.json({ ...result, executed: "SKIP_INSUFFICIENT_ETH" });
      }

      try {
        await client.fulfillOrder({
          order: floor.listing,
          accountAddress: bot,
        });
        actions.push("sweep:filled");

        // Follow through in the same run rather than leaving capital idle until the
        // next cycle. Reconcile still covers us if any of this crashes.
        const bought = await collectStrayNfts(client, collection, bot);
        if (bought.length) {
          await ensureVaultApproval(collection, bot);
          const depositTx = await vault.exchangeNFTsForTokens(bought);
          await depositTx.wait();
          actions.push(`sweep:deposited:${bought.length}`);
        }
        const postSweepWeth: bigint = await weth.balanceOf(bot);
        if (postSweepWeth < TARGET_WETH_FLOAT_WEI) {
          const restored = await restoreWethFloat({
            vault,
            quoter,
            swapRouter,
            bot,
            wethBalance: postSweepWeth,
            dryRun,
          });
          if (restored) actions.push(restored);
        }
      } catch (error) {
        // Listing raced away. The hard cancel already happened, so fall through to
        // re-posting a bid rather than leaving the bot with no order at all.
        console.error("Sweep fulfilment failed, falling back to bid:", error);
        await postOffer(client, bot, bidWei);
        return Response.json({ ...result, executed: "SWEEP_FAILED_REBID" });
      }
    } else if (action === "BID") {
      if (wethAvailable < bidWei) {
        console.error("Insufficient WETH to post bid");
        return Response.json({ ...result, executed: "SKIP_INSUFFICIENT_WETH" });
      }
      await postOffer(client, bot, bidWei);
      actions.push("bid:posted");
    } else if (action === "REPRICE_DOWN" || action === "REPRICE_UP") {
      if (openOrder) {
        await offchainCancel(client, openOrder);
        await postOffer(client, bot, bidWei);
        actions.push("reprice:done");
      }
    }

    return Response.json({ ...result, actions, executed: action });
  } catch (error) {
    console.error("Error running BBITS vault arbitrage:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
