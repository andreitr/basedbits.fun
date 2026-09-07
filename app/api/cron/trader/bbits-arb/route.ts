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
const MAX_SPEND_WEI = BigInt("3000000000000000"); // 0.003 ETH — one NFT

// The total ETH (WETH + native) the bot is seeded with and returns to after every
// acquisition. WETH and native are the same asset in two wrappers, so they share one
// float: whatever of a mint is left once this is whole is banked margin.
// Set this to the amount actually seeded.
const TARGET_ETH_FLOAT_WEI = BigInt("13000000000000000"); // 0.013 ETH

// Native ETH kept on hand for gas. Topped up by unwrapping WETH, never by selling
// BBITS directly, and never below what a bid needs.
const NATIVE_GAS_RESERVE_WEI = BigInt("5000000000000000"); // 0.005 ETH

// Below this, a swap or unwrap costs more gas than it moves. Used as the reprice
// threshold, the float-deficit floor, and the gas top-up floor.
const MIN_WORTHWHILE_WEI = GAS_BUFFER_WEI;

// Don't quote or sell BBITS dust: a sub-token input quotes to zero and the quoter
// helper treats zero as a corrupt read.
const MIN_SELL_BBITS_WEI = BigInt("1000000000000000000"); // 1 BBITS

const MIN_BBITS_RESERVE = BigInt(0); // optional floor protecting banked profit
const SLIPPAGE_BPS = BigInt(100); // 1% on the exit swap
const ESTIMATED_GAS = BigInt(600_000); // fulfill + approve + exchange + swap

// Guard against a corrupted price read — the one failure that can overbid real money.
const SANITY_PARITY_WEI = BigInt("2481770469241832"); // observed parity
const SANITY_BAND_BPS = BigInt(5_000); // accept +/- 50%

// Short expiry so a dead cron leaves no stale bid resting at a price that has drifted.
const OFFER_DURATION_SECONDS = 60 * 60;

// Pages of the OpenSea account index to walk when looking for held Based Bits.
// Spam NFTs are routine on Base, so a real holding can sit well past page one.
const MAX_NFT_PAGES = 10;

// Writes are disabled unless BBITS_ARB_DRY_RUN is explicitly "0".
const isDryRun = () => process.env.BBITS_ARB_DRY_RUN !== "0";

const SEAPORT_ABI = [
  "function getOrderStatus(bytes32 orderHash) view returns (bool isValidated, bool isCancelled, uint256 totalFilled, uint256 totalSize)",
] as const;

type Provider = ContractRunner & {
  getBalance: (a: string) => Promise<bigint>;
  getFeeData: () => Promise<{ maxFeePerGas: bigint | null }>;
};

type Keeper = {
  vault: Contract;
  collection: Contract;
  weth: Contract;
  swapRouter: Contract;
  quoter: Contract;
  provider: Provider;
  bot: string;
  dryRun: boolean;
};

const getOpenSeaClient = (signer: Wallet) =>
  new OpenSeaSDK(signer, {
    chain: Chain.Base,
    apiKey: process.env.OPENSEA_API_KEY,
  });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parameters = (protocolData: any) => protocolData?.parameters;

const min = (a: bigint, b: bigint) => (a < b ? a : b);

const effectiveGasBuffer = async (provider: Provider): Promise<bigint> => {
  try {
    const { maxFeePerGas } = await provider.getFeeData();
    const dynamic = (maxFeePerGas ?? BigInt(0)) * ESTIMATED_GAS;
    return dynamic > GAS_BUFFER_WEI ? dynamic : GAS_BUFFER_WEI;
  } catch {
    return GAS_BUFFER_WEI;
  }
};

/**
 * The bot's resting collection offers, newest first.
 *
 * The API returns cancelled and expired orders, and `assetContractAddress` filtering is
 * unreliable for criteria orders, so everything is re-checked in code against the
 * consideration item rather than trusted from the query.
 */
const findRestingOffers = async (client: OpenSeaSDK, maker: string) => {
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

type Floor = {
  listing: Awaited<
    ReturnType<OpenSeaSDK["api"]["getBestListings"]>
  >["listings"][number];
  totalCostWei: bigint;
  // Which balance the purchase draws from. Seaport pays ERC20 listings from WETH.
  currency: "native" | "weth";
  tokenId: string;
};

/**
 * Cheapest genuinely fulfillable listing, priced by summing the Seaport consideration —
 * that sum, not the headline `price`, is what the buyer actually pays.
 */
const findBestFloor = async (client: OpenSeaSDK): Promise<Floor | null> => {
  const { listings } = await client.api.getBestListings(COLLECTION_SLUG, 20);
  const nowSec = Math.floor(Date.now() / 1000);

  const priced = (listings ?? []).flatMap((listing): Floor[] => {
    const params = parameters(listing.protocol_data);
    const consideration = params?.consideration ?? [];
    const tokenId: string | undefined =
      params?.offer?.[0]?.identifierOrCriteria;
    if (!consideration.length || !tokenId) return [];

    // Expiring imminently — would likely revert between decision and fulfilment.
    if (Number(params.endTime ?? 0) <= nowSec + 120) return [];

    let total = BigInt(0);
    let currency: Floor["currency"] | null = null;
    for (const item of consideration) {
      // Only NATIVE (0) and ERC20 (1) are payment items; anything else means this is
      // not a plain sale and the cost calculation would be wrong.
      const itemType = Number(item.itemType);
      let itemCurrency: Floor["currency"];
      if (itemType === 0) {
        itemCurrency = "native";
      } else if (
        itemType === 1 &&
        getAddress(item.token) === getAddress(WETH_ADDRESS)
      ) {
        itemCurrency = "weth";
      } else {
        return [];
      }
      // A listing paid in two currencies at once can't be affordability-checked
      // against a single balance.
      if (currency && currency !== itemCurrency) return [];
      currency = itemCurrency;

      // Dutch auction: price is time-dependent, so a static total is meaningless.
      if (item.startAmount !== item.endAmount) return [];
      total += BigInt(item.startAmount);
    }

    if (total <= BigInt(0) || !currency) return [];
    return [{ listing, totalCostWei: total, currency, tokenId }];
  });

  priced.sort((a, b) => (a.totalCostWei < b.totalCostWei ? -1 : 1));
  return priced[0] ?? null;
};

/**
 * Token ids the bot holds but hasn't deposited yet — i.e. a bid filled, or a previous
 * run died between buying and depositing.
 *
 * The collection is an EIP-1167 proxy with no ERC721Enumerable, so ids come from
 * OpenSea's account index. That index lags and paginates, so every page is walked
 * and every candidate is re-confirmed on-chain with ownerOf.
 */
const collectStrayNfts = async (
  client: OpenSeaSDK,
  collection: Contract,
  bot: string,
  heldCount: bigint,
): Promise<string[]> => {
  if (heldCount <= BigInt(0)) return [];

  const candidates: string[] = [];
  let next: string | undefined;
  for (let page = 0; page < MAX_NFT_PAGES; page++) {
    const response = await client.api.getNFTsByAccount(
      bot,
      50,
      next,
      Chain.Base,
    );
    for (const nft of response?.nfts ?? []) {
      if (getAddress(nft.contract) === getAddress(BBITS_COLLECTION)) {
        candidates.push(nft.identifier);
      }
    }
    // Stop as soon as every held token is accounted for, or the index runs out.
    if (candidates.length >= Number(heldCount) || !response?.next) break;
    next = response.next;
  }

  const owners = await Promise.allSettled(
    candidates.map((id) => collection.ownerOf(id)),
  );
  const owned = candidates.filter((_, i) => {
    const r = owners[i];
    return r.status === "fulfilled" && getAddress(r.value) === getAddress(bot);
  });

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
  token: Contract,
  bot: string,
  needed: bigint,
) => {
  const allowance: bigint = await token.allowance(bot, SWAP_ROUTER_02_ADDRESS);
  if (allowance >= needed) return;
  const tx = await token.approve(SWAP_ROUTER_02_ADDRESS, MaxUint256);
  await tx.wait();
};

const depositNfts = async (k: Keeper, ids: string[]) => {
  await ensureVaultApproval(k.collection, k.bot);
  const tx = await k.vault.exchangeNFTsForTokens(ids);
  await tx.wait();
};

/**
 * Sell BBITS to bring the combined ETH float (WETH + native) back to target.
 *
 * `maxSellBbits` is the safety bound that keeps banked margin intact: callers pass the
 * size of the mint they just received, so a deficit larger than one acquisition can
 * explain — a second fill OpenSea hasn't indexed yet — is left for a later run rather
 * than covered out of profit from earlier cycles. Sized by exact output, falling back
 * to exact input on the bounded amount only when the mint can't cover the whole gap.
 */
const restoreFloat = async (
  k: Keeper,
  maxSellBbits: bigint,
): Promise<string | null> => {
  const [wethBalance, nativeBalance, bbitsBalance]: bigint[] =
    await Promise.all([
      k.weth.balanceOf(k.bot),
      k.provider.getBalance(k.bot),
      k.vault.balanceOf(k.bot),
    ]);

  const deficit = TARGET_ETH_FLOAT_WEI - (wethBalance + nativeBalance);
  if (deficit < MIN_WORTHWHILE_WEI) return null;

  const banked =
    bbitsBalance > MIN_BBITS_RESERVE
      ? bbitsBalance - MIN_BBITS_RESERVE
      : BigInt(0);
  const spendable = min(banked, maxSellBbits);
  if (spendable < MIN_SELL_BBITS_WEI) return null;

  const needIn = await quoteBbitsForExactWeth(k.quoter, deficit);
  const amountInMaximum =
    (needIn * (BigInt(10_000) + SLIPPAGE_BPS)) / BigInt(10_000);

  if (amountInMaximum <= spendable) {
    if (k.dryRun)
      return `settle:swap-planned:${formatEther(amountInMaximum)}-bbits`;
    await ensureSwapAllowance(k.vault, k.bot, amountInMaximum);
    const tx = await k.swapRouter.exactOutputSingle({
      tokenIn: BBITS_VAULT,
      tokenOut: WETH_ADDRESS,
      fee: POOL_FEE,
      recipient: k.bot,
      amountOut: deficit,
      amountInMaximum,
      sqrtPriceLimitX96: 0,
    });
    await tx.wait();
    return "settle:float-restored";
  }

  // Parity fell below the cost basis — the mint can't cover the whole gap. Recover what
  // this acquisition can, bounded by maxSellBbits so banked margin stays untouched.
  const partialOut = await quoteWethForBbits(k.quoter, spendable);
  if (partialOut < MIN_WORTHWHILE_WEI) {
    console.log(
      `Partial recovery of ${formatEther(partialOut)} ETH below the ${formatEther(MIN_WORTHWHILE_WEI)} floor — holding`,
    );
    return "settle:partial-below-threshold";
  }
  console.log(
    `Cannot fully restore ETH float: need ${formatEther(amountInMaximum)} BBITS, selling ${formatEther(spendable)}`,
  );
  if (k.dryRun) return "settle:partial-swap-planned";

  const amountOutMinimum =
    (partialOut * (BigInt(10_000) - SLIPPAGE_BPS)) / BigInt(10_000);
  await ensureSwapAllowance(k.vault, k.bot, spendable);
  const tx = await k.swapRouter.exactInputSingle({
    tokenIn: BBITS_VAULT,
    tokenOut: WETH_ADDRESS,
    fee: POOL_FEE,
    recipient: k.bot,
    amountIn: spendable,
    amountOutMinimum,
    sqrtPriceLimitX96: 0,
  });
  await tx.wait();
  return "settle:float-partial";
};

/**
 * Keep enough native ETH for gas by unwrapping WETH — the only direction the bot ever
 * converts. Never unwraps below what a bid needs, so a gas top-up can't defeat bidding.
 */
const ensureGasReserve = async (
  k: Keeper,
  maxPayWei: bigint,
): Promise<string | null> => {
  const [wethBalance, nativeBalance]: bigint[] = await Promise.all([
    k.weth.balanceOf(k.bot),
    k.provider.getBalance(k.bot),
  ]);
  const deficit = NATIVE_GAS_RESERVE_WEI - nativeBalance;
  if (deficit < MIN_WORTHWHILE_WEI) return null;

  const surplus = wethBalance > maxPayWei ? wethBalance - maxPayWei : BigInt(0);
  const amount = min(deficit, surplus);
  if (amount < MIN_WORTHWHILE_WEI) return null;

  if (k.dryRun) return `settle:unwrap-planned:${formatEther(amount)}-eth`;
  const tx = await k.weth.withdraw(amount);
  await tx.wait();
  return `settle:unwrapped:${formatEther(amount)}-eth`;
};

/**
 * Close out an acquisition (or recover from a run that died before doing so): make the
 * ETH float whole from the mint, then make sure gas is covered. Whatever BBITS remains
 * is margin.
 *
 * Selling the whole mint and buying BBITS back with the proceeds was considered and
 * rejected: the rebuy is funded by the larger sale moments earlier, so it nets out
 * against itself in the pool while paying the 0.3% fee twice — measurably less BBITS
 * retained (97.4 vs 99.2 per fill) for the same net market impact.
 */
const settle = async (
  k: Keeper,
  maxSellBbits: bigint,
  maxPayWei: bigint,
): Promise<string[]> => {
  const done: string[] = [];
  const restored = await restoreFloat(k, maxSellBbits);
  if (restored) done.push(restored);
  const topped = await ensureGasReserve(k, maxPayWei);
  if (topped) done.push(topped);
  return done;
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
const postOffer = async (client: OpenSeaSDK, bot: string, priceWei: bigint) => {
  await client.createCollectionOffer({
    collectionSlug: COLLECTION_SLUG,
    accountAddress: bot,
    amount: formatEther(priceWei),
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
    const k: Keeper = {
      vault,
      collection,
      weth,
      swapRouter,
      quoter,
      provider,
      bot,
      dryRun,
    };
    const actions: string[] = [];

    // --- Parity -------------------------------------------------------------
    // Independent reads are issued together so ethers can batch them into one POST.
    const [conversionRate, gasBufferWei, heldNfts]: [bigint, bigint, bigint] =
      await Promise.all([
        vault.conversionRate(),
        effectiveGasBuffer(provider),
        collection.balanceOf(bot),
      ]);
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

    // The most the bot will pay for one NFT, by either route. This single value gates
    // bids, sweeps, and repricing so the exposure bound has exactly one definition.
    const maxProfitablePriceWei = parityWei - TARGET_MARGIN_WEI - gasBufferWei;
    const maxPayWei = min(maxProfitablePriceWei, MAX_SPEND_WEI);

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
    const strayNfts = await collectStrayNfts(client, collection, bot, heldNfts);
    if (strayNfts.length) {
      actions.push(`recover:deposit:${strayNfts.length}`);
      if (!dryRun) await depositNfts(k, strayNfts);
    }

    // Settle whenever it is safe to attribute the deficit. After a deposit the sale is
    // bounded to that mint, so it is safe even if more fills are still unindexed. With
    // nothing deposited, only proceed once no NFT is pending — a filled bid OpenSea
    // hasn't indexed yet would otherwise have its shortfall covered out of banked
    // margin. The bound of one mint keeps a crash-recovery sale from overreaching too.
    const pendingNfts: bigint =
      strayNfts.length && !dryRun ? await collection.balanceOf(bot) : heldNfts;
    if (strayNfts.length || pendingNfts === BigInt(0)) {
      const mints = BigInt(Math.max(strayNfts.length, 1));
      actions.push(...(await settle(k, mints * conversionRate, maxPayWei)));
    } else {
      actions.push("recover:awaiting-deposit");
    }

    // --- Step 1: single-open-order invariant --------------------------------
    // A read failure must never fall through to "no open order -> bid": failing
    // closed is the only safe response when the orderbook is unknown. The two
    // OpenSea reads are independent, so they run together.
    const [restingOffers, floor, wethAvailable, nativeAvailable]: [
      OrderV2[],
      Floor | null,
      bigint,
      bigint,
    ] = await Promise.all([
      findRestingOffers(client, bot),
      findBestFloor(client),
      weth.balanceOf(bot),
      provider.getBalance(bot),
    ]);

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
    const floorTotalWei = floor?.totalCostWei ?? null;

    let action: string;
    let reason = "";

    if (floorTotalWei !== null && floorTotalWei <= maxPayWei) {
      action = "SWEEP";
      reason = "floor clears margin outright";
    } else if (!openOrder) {
      action = "BID";
      reason = "no resting offer";
    } else if (openOrderPriceWei > maxPayWei + MIN_WORTHWHILE_WEI) {
      // The resting price is above what the margin now supports: mandatory.
      action = "REPRICE_DOWN";
      reason = "margin eroded below target";
    } else if (openOrderPriceWei < maxPayWei - MIN_WORTHWHILE_WEI) {
      // The resting price has fallen behind what the bot would pay today. Comparing
      // against maxPayWei rather than raw parity means an offer already pinned at the
      // spend cap is left alone instead of being cancelled and re-posted unchanged.
      action = "REPRICE_UP";
      reason = "offer stale below market";
    } else {
      action = "HOLD";
      reason = "within tolerance";
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
      maxPayWei: maxPayWei.toString(),
      maxPayEth: formatEther(maxPayWei),
      floorTotalWei: floorTotalWei?.toString() ?? null,
      floorCurrency: floor?.currency ?? null,
      openOrderPriceWei: openOrder ? openOrderPriceWei.toString() : null,
      wethBalanceWei: wethAvailable.toString(),
      nativeBalanceWei: nativeAvailable.toString(),
    };

    if (dryRun) {
      console.log("bbits-arb dry run:", result);
      return Response.json(result);
    }

    // --- Step 3: execute ----------------------------------------------------
    const canFundBid = wethAvailable >= maxPayWei;

    if (action === "SWEEP" && floor) {
      // Affordability is checked against the currency the listing is actually paid in,
      // and BEFORE the resting bid is touched: cancelling first and then discovering
      // the sweep is unfundable would destroy a healthy offer for nothing.
      const payBalance =
        floor.currency === "weth" ? wethAvailable : nativeAvailable;
      if (payBalance < floor.totalCostWei + gasBufferWei) {
        console.error(`Insufficient ${floor.currency} balance to sweep`);
        return Response.json({
          ...result,
          executed: "SKIP_INSUFFICIENT_FUNDS",
        });
      }

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

      // Only the purchase itself is caught here. Everything after it is post-purchase
      // bookkeeping: folding it into this catch would report a completed buy as a
      // failed sweep and then place a compensating bid on top of the NFT we just won.
      let filled = false;
      try {
        await client.fulfillOrder({
          order: floor.listing,
          accountAddress: bot,
        });
        filled = true;
      } catch (error) {
        console.error("Sweep fulfilment threw:", error);
      }

      // The SDK resolves on any mined receipt, reverted or not, so success is decided
      // by ownership rather than by the promise settling.
      if (filled) {
        try {
          const owner: string = await collection.ownerOf(floor.tokenId);
          filled = getAddress(owner) === getAddress(bot);
        } catch {
          filled = false;
        }
      }

      if (!filled) {
        // Listing raced away or the fill reverted. The hard cancel already happened,
        // so re-post a bid rather than leaving the bot with no order at all.
        if (canFundBid) {
          await postOffer(client, bot, maxPayWei);
          return Response.json({ ...result, executed: "SWEEP_FAILED_REBID" });
        }
        console.error("Insufficient WETH to re-post a bid after failed sweep");
        return Response.json({ ...result, executed: "SWEEP_FAILED_NO_REBID" });
      }
      actions.push(`sweep:filled:${floor.tokenId}`);

      // Follow through in the same run using the id from the listing itself — the
      // OpenSea account index lags right after a fill, so re-discovering it there
      // would usually defer the deposit to the next tick.
      await depositNfts(k, [floor.tokenId]);
      actions.push("sweep:deposited");
      actions.push(...(await settle(k, conversionRate, maxPayWei)));
    } else if (action === "BID") {
      if (!canFundBid) {
        console.error("Insufficient WETH to post bid");
        return Response.json({ ...result, executed: "SKIP_INSUFFICIENT_WETH" });
      }
      await postOffer(client, bot, maxPayWei);
      actions.push("bid:posted");
    } else if (action === "REPRICE_DOWN" || action === "REPRICE_UP") {
      if (openOrder) {
        // Check funding before cancelling: otherwise a short float trades a healthy
        // resting order for an un-honourable one, or for no order at all if the
        // repost throws after the cancel has already gone through.
        if (!canFundBid) {
          console.error(
            "Insufficient WETH to reprice — leaving existing offer",
          );
          return Response.json({
            ...result,
            executed: "SKIP_INSUFFICIENT_WETH",
          });
        }
        await offchainCancel(client, openOrder);
        await postOffer(client, bot, maxPayWei);
        actions.push("reprice:done");
      }
    }

    return Response.json({ ...result, executed: action });
  } catch (error) {
    console.error("Error running BBITS vault arbitrage:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
