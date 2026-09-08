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
  EventLog,
  MaxUint256,
  Wallet,
  ZeroAddress,
  formatEther,
  getAddress,
} from "ethers";
import { NextRequest } from "next/server";
import { Chain, OpenSeaSDK, type OrderV2, type ProtocolData } from "opensea-js";

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

// Blocks to look back for a deposit that no sale has followed. ~67 minutes on Base's
// 2s blocks — a crash last tick plus a few failed retries — and within the
// eth_getLogs range Alchemy accepts. A deposit older than this simply isn't
// recovered: its mint stays in the wallet mislabelled as margin. Safe, just unpaid.
const UNSETTLED_LOOKBACK_BLOCKS = 2000;

const SEAPORT_ABI = [
  "function getOrderStatus(bytes32 orderHash) view returns (bool isValidated, bool isCancelled, uint256 totalFilled, uint256 totalSize)",
] as const;

type Provider = ContractRunner & {
  getBalance: (a: string) => Promise<bigint>;
  getFeeData: () => Promise<{ maxFeePerGas: bigint | null }>;
  getBlockNumber: () => Promise<number>;
};

type Keeper = {
  vault: Contract;
  collection: Contract;
  weth: Contract;
  swapRouter: Contract;
  quoter: Contract;
  provider: Provider;
  bot: string;
};

const getOpenSeaClient = (signer: Wallet) =>
  new OpenSeaSDK(signer, {
    chain: Chain.Base,
    apiKey: process.env.OPENSEA_API_KEY,
  });

const parameters = (protocolData: ProtocolData | undefined) =>
  protocolData?.parameters;

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

// Pages of the collection offer book to walk when looking for the bot's own bids.
const MAX_OFFER_PAGES = 20;

// Seaport ItemType for an ERC721 consideration resolved by merkle criteria — the
// shape of every collection offer.
const ERC721_WITH_CRITERIA = 4;

/**
 * The subset of an OpenSea order the run needs: enough to price it, cancel it on- or
 * off-chain, and confirm the cancel. Built from the collection offer feed rather than
 * the SDK's `OrderV2`, whose backing endpoint (`/orders/{chain}/{protocol}/offers`)
 * OpenSea has removed (it now answers 405).
 */
type RestingOffer = Pick<
  OrderV2,
  "orderHash" | "protocolAddress" | "protocolData"
>;

/**
 * The bot's resting collection offers, newest first.
 *
 * The offer feed only returns active, valid orders, so cancelled, filled and expired
 * bids are already gone; expiry is still re-checked in code because the feed's view
 * can lag. The feed is collection-wide with no maker filter, so every page is walked
 * and filtered by offerer, and the consideration item is checked against the
 * collection rather than trusting the slug.
 */
const findRestingOffers = async (
  client: OpenSeaSDK,
  maker: string,
): Promise<RestingOffer[]> => {
  const nowSec = BigInt(Math.floor(Date.now() / 1000));
  const makerAddress = getAddress(maker);
  const found: { offer: RestingOffer; startTime: bigint }[] = [];

  let next: string | undefined;
  for (let page = 0; page < MAX_OFFER_PAGES; page++) {
    const response = await client.api.getAllOffers(COLLECTION_SLUG, 100, next);
    for (const offer of response.offers) {
      const params = offer.protocol_data?.parameters;
      if (!params) continue;
      if (getAddress(params.offerer) !== makerAddress) continue;
      if (BigInt(params.endTime) <= nowSec) continue;

      // Collection (criteria) offers only — the bot never bids on a single token.
      // Read off the signed Seaport item rather than the API's optional `criteria`
      // field: an ERC721_WITH_CRITERIA consideration is what a collection offer is.
      const item = params.consideration?.[0];
      if (!item || Number(item.itemType) !== ERC721_WITH_CRITERIA) continue;
      if (getAddress(item.token) !== getAddress(BBITS_COLLECTION)) continue;

      found.push({
        offer: {
          orderHash: offer.order_hash,
          protocolAddress: offer.protocol_address,
          protocolData: offer.protocol_data,
        },
        startTime: BigInt(params.startTime),
      });
    }
    next = response.next;
    if (!next) break;
  }

  return found
    .sort((a, b) =>
      a.startTime > b.startTime ? -1 : a.startTime < b.startTime ? 1 : 0,
    )
    .map(({ offer }) => offer);
};

// The exact WETH the bot has committed, read off the Seaport offer item rather than
// `currentPrice`, which is a derived display value.
const restingOfferPriceWei = (order: RestingOffer): bigint =>
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
    if (!params) return [];
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

  const owned: string[] = [];
  let next: string | undefined;
  for (let page = 0; page < MAX_NFT_PAGES; page++) {
    const response = await client.api.getNFTsByAccount(
      bot,
      50,
      next,
      Chain.Base,
    );
    const candidates = (response?.nfts ?? [])
      .filter(
        (nft) => getAddress(nft.contract) === getAddress(BBITS_COLLECTION),
      )
      .map((nft) => nft.identifier);

    // Confirm each page on-chain before deciding whether to keep walking. The index
    // can still list a token the bot already deposited, so counting raw candidates
    // would stop pagination early while the token actually held sits on a later page.
    const owners = await Promise.allSettled(
      candidates.map((id) => collection.ownerOf(id)),
    );
    candidates.forEach((id, i) => {
      const r = owners[i];
      if (r.status === "fulfilled" && getAddress(r.value) === getAddress(bot)) {
        owned.push(id);
      }
    });

    // Stop once every held token is confirmed, or the index runs out.
    if (owned.length >= Number(heldCount) || !response?.next) break;
    next = response.next;
  }

  if (owned.length < Number(heldCount)) {
    console.log(
      `Holding ${heldCount} Based Bits but resolved ${owned.length} ids — OpenSea index lag, retrying next run`,
    );
  }
  return owned;
};

/**
 * BBITS minted by a deposit that no sale has followed — the signature of a run that
 * died between depositing and settling.
 *
 * Decided by event ORDER, not amounts. By amount, retained margin is also "unsold
 * mint", which is exactly what makes balance-based attribution impossible; but only
 * an unsettled deposit has no outbound transfer after it. Bounded to mints since the
 * last sale, so a deposit is recovered at most once and nothing minted earlier is
 * ever reached. Fails closed: a read error reports nothing unsettled.
 */
const findUnsettledMint = async (k: Keeper): Promise<bigint> => {
  try {
    const latest = await k.provider.getBlockNumber();
    const from = Math.max(0, latest - UNSETTLED_LOOKBACK_BLOCKS);
    const [mints, sales] = await Promise.all([
      k.vault.queryFilter(
        k.vault.filters.Transfer(ZeroAddress, k.bot),
        from,
        latest,
      ),
      k.vault.queryFilter(k.vault.filters.Transfer(k.bot, null), from, latest),
    ]);
    const lastSale = sales.reduce((m, e) => Math.max(m, e.blockNumber), -1);
    let unsettled = BigInt(0);
    for (const e of mints) {
      if (e instanceof EventLog && e.blockNumber > lastSale) {
        unsettled += BigInt(e.args[2]);
      }
    }
    return unsettled;
  } catch (error) {
    console.error(
      "Could not read deposit/sale history — assuming nothing unsettled:",
      error,
    );
    return BigInt(0);
  }
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
  allowPartial: boolean,
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

  // Parity fell below the cost basis — the mint can't cover the whole gap.
  if (!allowPartial) {
    // Without a fresh mint to attribute it to, a partial sale would leave a residual
    // deficit that every later tick would chase out of banked margin. Leave it.
    console.log(
      `Deficit ${formatEther(deficit)} ETH exceeds what one mint covers — not selling without a fresh deposit`,
    );
    return "settle:deficit-exceeds-mint";
  }
  // Recover what this acquisition can, bounded by maxSellBbits so banked margin stays
  // untouched.
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
  allowPartial: boolean,
): Promise<string[]> => {
  const done: string[] = [];
  const restored = await restoreFloat(k, maxSellBbits, allowPartial);
  if (restored) done.push(restored);
  const topped = await ensureGasReserve(k, maxPayWei);
  if (topped) done.push(topped);
  return done;
};

/**
 * Gasless cancel via OpenSea's SignedZone. Returns whether the order is now certainly
 * unfillable. The zone cannot revoke a fulfilment signature it has already handed to
 * a seller; the API reports how long such a signature stays valid, and until then the
 * old order can still fill.
 */
const offchainCancel = async (
  client: OpenSeaSDK,
  order: RestingOffer,
): Promise<boolean> => {
  // No hash means no cancel was even attempted: the signed Seaport order is still
  // usable from its protocol data. Report it live so callers escalate on-chain.
  if (!order.orderHash) return false;
  const response = await client.offchainCancelOrder(
    order.protocolAddress,
    order.orderHash,
    Chain.Base,
    undefined,
    true, // derive the offerer signature from the bot's signer
  );
  const validUntil = response?.last_signature_issued_valid_until;
  if (!validUntil) return true;
  // Accept either an ISO timestamp or unix seconds. Anything unparseable is treated
  // as still live: fail closed rather than risk the old and new offers both filling.
  const untilMs = /^\d+$/.test(validUntil)
    ? Number(validUntil) * 1000
    : Date.parse(validUntil);
  return Number.isFinite(untilMs) && untilMs <= Date.now();
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

/**
 * On-chain Seaport cancel. The SDK types this against `OrderV2` but only reads the
 * protocol address and the signed order parameters, both of which a RestingOffer
 * carries, hence the cast.
 */
const hardCancel = async (
  client: OpenSeaSDK,
  order: RestingOffer,
  accountAddress: string,
) => {
  await client.cancelOrder({ order: order as OrderV2, accountAddress });
};

// The SDK awaits its own confirmation, but that wrapper is soft. Read the canonical
// on-chain status before spending, using the order's own protocol address.
const confirmCancelled = async (
  provider: ContractRunner,
  order: RestingOffer,
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
    };
    const actions: string[] = [];

    // --- Parity -------------------------------------------------------------
    // Independent reads are issued together so ethers can batch them into one POST.
    // Resting offers are loaded here, before any write: whatever the run does next
    // must start from a known orderbook so a live offer can be de-risked first. A
    // read failure therefore fails the whole run closed — nothing is written while
    // the orderbook is unknown.
    const [conversionRate, gasBufferWei, heldNfts, restingOffers]: [
      bigint,
      bigint,
      bigint,
      RestingOffer[],
    ] = await Promise.all([
      vault.conversionRate(),
      effectiveGasBuffer(provider),
      collection.balanceOf(bot),
      findRestingOffers(client, bot),
    ]);
    let parityWei = await quoteParityWei(quoter, conversionRate);

    const lower =
      (SANITY_PARITY_WEI * (BigInt(10_000) - SANITY_BAND_BPS)) / BigInt(10_000);
    const upper =
      (SANITY_PARITY_WEI * (BigInt(10_000) + SANITY_BAND_BPS)) / BigInt(10_000);
    if (parityWei < lower || parityWei > upper) {
      console.error(
        `Parity ${parityWei} outside sanity band [${lower}, ${upper}] — skipping run`,
      );
      // De-risk before bailing. Whether the quote is corrupt or the market genuinely
      // moved, an offer priced from an earlier parity is no longer justifiable and
      // could fill at a severe loss within its hour. Nothing else is done on a suspect
      // price — no settle, no bid — only the cancel, on-chain and confirmed.
      let cancelled = 0;
      for (const order of restingOffers) {
        await hardCancel(client, order, bot);
        if (await confirmCancelled(provider, order)) cancelled++;
        else console.error("On-chain cancel unconfirmed during sanity abort");
      }
      return Response.json(
        {
          ok: false,
          action: "ABORT_PARITY_SANITY",
          parityWei: parityWei.toString(),
          restingOffers: restingOffers.length,
          cancelled,
        },
        { status: 200 },
      );
    }

    // The most the bot will pay for one NFT, by either route. This single value gates
    // bids, sweeps, and repricing so the exposure bound has exactly one definition.
    // A helper because it is recomputed after any reconciliation sale moves the pool.
    // maxPayWei is clamped at zero: when nothing is profitable the bot still reconciles
    // and cancels, and the gas-reserve maths must not see a negative bid size. A parity
    // that has drifted out of the sanity band after a sale is treated as unprofitable,
    // which routes it through the same cancel-and-hold path.
    const priceCeiling = (parity: bigint) => {
      const maxProfitablePriceWei = parity - TARGET_MARGIN_WEI - gasBufferWei;
      const inBand = parity >= lower && parity <= upper;
      const profitable = maxProfitablePriceWei > BigInt(0) && inBand;
      return {
        maxProfitablePriceWei,
        maxPayWei: profitable
          ? min(maxProfitablePriceWei, MAX_SPEND_WEI)
          : BigInt(0),
        unprofitable: !profitable,
      };
    };
    let { maxProfitablePriceWei, maxPayWei, unprofitable } =
      priceCeiling(parityWei);

    // --- Step 0: reconcile --------------------------------------------------
    // Orderbook hygiene comes first, ahead of every write. Recovery writes can throw
    // (approval, deposit, RPC) and exit through the outer catch; if a live offer were
    // still resting at that point it would stay fillable while an acquisition is
    // pending. So duplicates and any offer coexisting with a held NFT are dealt with
    // here, where nothing has been written yet.
    if (restingOffers.length > 1) {
      actions.push(`recover:duplicate-offers:${restingOffers.length}`);
      for (const stale of restingOffers.slice(1)) {
        // Duplicates are an invariant violation and must be certainly dead before
        // anything else runs: a sweep hard-cancels only the newest offer and a
        // reprice posts a replacement, either of which would leave a still-signed
        // duplicate able to fill. Escalate to on-chain when off-chain can't assure it.
        if (await offchainCancel(client, stale)) continue;
        await hardCancel(client, stale, bot);
        if (!(await confirmCancelled(provider, stale))) {
          console.error(
            "Duplicate offer could not be cancelled — aborting run",
          );
          return Response.json({
            ok: false,
            action: "ABORT_DUPLICATE_UNCANCELLED",
            actions,
            parityWei: parityWei.toString(),
          });
        }
        actions.push("recover:duplicate-hard-cancelled");
      }
    }
    let openOrder: RestingOffer | null = restingOffers[0] ?? null;

    // One unsettled acquisition at a time. findRestingOffers filters finalized orders,
    // so an offer still resting while the bot holds an NFT is a separate live one — a
    // surviving duplicate, or one placed from elsewhere — that could fill before the
    // deposit lands. Hard-cancelled here, before the deposit is attempted.
    if (heldNfts > BigInt(0) && openOrder) {
      actions.push("recover:cancel-offer-while-holding");
      await hardCancel(client, openOrder, bot);
      if (!(await confirmCancelled(provider, openOrder))) {
        console.error(
          "On-chain cancel unconfirmed while holding an NFT — aborting run",
        );
        return Response.json({
          ok: false,
          action: "ABORT_CANCEL_UNCONFIRMED",
          actions,
          parityWei: parityWei.toString(),
        });
      }
      openOrder = null;
    }

    // Every check below derives from live on-chain balances, so a crash at any point
    // re-derives the same state on the next run.
    const strayNfts = await collectStrayNfts(client, collection, bot, heldNfts);
    if (strayNfts.length) {
      actions.push(`recover:deposit:${strayNfts.length}`);
      await depositNfts(k, strayNfts);
    }

    const pendingNfts: bigint = strayNfts.length
      ? await collection.balanceOf(bot)
      : heldNfts;
    if (strayNfts.length) {
      // A mint this run: sell from it, bounded to its size. Safe even if more fills
      // are still unindexed, since the bound can't reach anything minted earlier.
      const minted = BigInt(strayNfts.length) * conversionRate;
      actions.push(...(await settle(k, minted, maxPayWei, true)));
    } else if (pendingNfts > BigInt(0)) {
      // A filled bid OpenSea hasn't indexed yet: its shortfall must wait for its own
      // deposit, not be covered out of banked margin.
      actions.push("recover:awaiting-deposit");
    } else {
      // No mint this run and nothing pending. Look for on-chain evidence of a deposit
      // no sale has followed — a previous run that died between depositing and
      // settling. Keyed on that evidence rather than on whether the next bid is
      // affordable: one acquisition usually leaves WETH well above maxPayWei, and a
      // native sweep leaves it untouched, so affordability never signals this state.
      // Recovered by exact output only, so it either clears the deficit or does
      // nothing, and bounded to the unsettled mint so banked margin is never reached.
      const unsettled = await findUnsettledMint(k);
      if (unsettled > BigInt(0)) {
        actions.push(`recover:unsettled-mint:${formatEther(unsettled)}-bbits`);
        actions.push(...(await settle(k, unsettled, maxPayWei, false)));
      }
    }

    // A settlement sells BBITS into a shallow pool, which moves the very price this
    // run was priced from. Requote after any sale so the decision below is against
    // the pool as it is now, not as it was before the bot pushed it.
    if (
      actions.includes("settle:float-restored") ||
      actions.includes("settle:float-partial")
    ) {
      parityWei = await quoteParityWei(quoter, conversionRate);
      ({ maxProfitablePriceWei, maxPayWei, unprofitable } =
        priceCeiling(parityWei));
      actions.push(`requote:parity:${formatEther(parityWei)}-eth`);
    }

    // Placed ahead of the market-state reads below on purpose: this cancel needs
    // nothing from them, and gating it behind unrelated floor/balance fetches meant a
    // transient rejection there reached the outer catch with the offer still live.
    if (unprofitable) {
      // No price clears margin+gas right now (a fee spike, or parity collapsed). An
      // offer posted under earlier conditions would fill at exactly the loss this
      // guard detected, so it is cancelled on-chain before holding — the hard form,
      // since off-chain cancel can't revoke a fulfilment signature already vended.
      if (openOrder) {
        actions.push("hold:cancel-unprofitable-offer");
        await hardCancel(client, openOrder, bot);
        if (!(await confirmCancelled(provider, openOrder))) {
          console.error("On-chain cancel unconfirmed while holding");
        }
      }
      return Response.json({
        ok: true,
        action: "HOLD",
        reason: "margin+gas exceeds parity",
        actions,
        parityWei: parityWei.toString(),
        gasBufferWei: gasBufferWei.toString(),
      });
    }

    // --- Step 1: market state -----------------------------------------------
    const [floor, wethAvailable, nativeAvailable]: [
      Floor | null,
      bigint,
      bigint,
    ] = await Promise.all([
      findBestFloor(client),
      weth.balanceOf(bot),
      provider.getBalance(bot),
    ]);
    const openOrderPriceWei = openOrder
      ? restingOfferPriceWei(openOrder)
      : BigInt(0);

    // --- Step 2: decide -----------------------------------------------------
    const floorTotalWei = floor?.totalCostWei ?? null;

    let action: string;
    let reason = "";

    if (pendingNfts > BigInt(0)) {
      // One unsettled acquisition at a time. A held NFT that OpenSea hasn't indexed
      // yet is exposure the float hasn't been repaid for; buying or bidding again
      // now would stack a second on top of it.
      //
      // Any resting order is cancelled too, not left alone. findRestingOffers filters
      // finalized orders, so the offer that produced the held NFT is already gone —
      // whatever is still resting is a *separate* live offer (a surviving duplicate,
      // or one placed from elsewhere) that could fill before the deposit lands.
      action = "HOLD_PENDING";
      reason = "awaiting deposit of held NFT";
      if (openOrder) actions.push("hold:cancel-offer-while-pending");
    } else if (floorTotalWei !== null && floorTotalWei <= maxPayWei) {
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

    // --- Step 3: execute ----------------------------------------------------
    if (action === "HOLD_PENDING") {
      if (openOrder) {
        // Hard cancel: a fill here would stack a second acquisition on the one still
        // awaiting deposit, and off-chain cancel can't revoke a signature already vended.
        await hardCancel(client, openOrder, bot);
        if (!(await confirmCancelled(provider, openOrder))) {
          console.error("On-chain cancel unconfirmed while awaiting deposit");
          return Response.json({
            ...result,
            executed: "HOLD_CANCEL_UNCONFIRMED",
          });
        }
        actions.push("hold:offer-cancelled");
      }
      return Response.json({ ...result, executed: action });
    }

    const canFundBid = wethAvailable >= maxPayWei;

    if (action === "SWEEP" && floor) {
      // Affordability is checked against the currency the listing is actually paid in,
      // and BEFORE the resting bid is touched: cancelling first and then discovering
      // the sweep is unfundable would destroy a healthy offer for nothing.
      // Gas is always paid in native ETH, so it is charged against the native balance
      // regardless of which currency the listing itself is priced in.
      const affordable =
        floor.currency === "weth"
          ? wethAvailable >= floor.totalCostWei &&
            nativeAvailable >= gasBufferWei
          : nativeAvailable >= floor.totalCostWei + gasBufferWei;
      if (!affordable) {
        console.error(`Insufficient ${floor.currency} balance to sweep`);
        return Response.json({
          ...result,
          executed: "SKIP_INSUFFICIENT_FUNDS",
        });
      }

      // A resting bid must be hard-cancelled first: a seller could otherwise fill it
      // independently of this purchase, committing capital twice in one cycle.
      if (openOrder) {
        await hardCancel(client, openOrder, bot);
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
      try {
        await client.fulfillOrder({
          order: floor.listing,
          accountAddress: bot,
        });
      } catch (error) {
        // Not conclusive either way: the SDK can throw after the purchase has already
        // been broadcast, e.g. a transient RPC failure while awaiting confirmation.
        console.error("Sweep fulfilment threw:", error);
      }

      // Ownership is the only source of truth, so it is checked whether or not the SDK
      // threw. The promise resolves on any mined receipt, reverted or not, and it can
      // reject after a successful broadcast — deciding on it alone would either report
      // a reverted fill as won, or re-bid on top of an NFT the bot already holds.
      let owned: boolean | null;
      try {
        const owner: string = await collection.ownerOf(floor.tokenId);
        owned = getAddress(owner) === getAddress(bot);
      } catch {
        owned = null;
      }

      if (owned === null) {
        // Can't tell — fail closed. Re-bidding is the one move that could double the
        // exposure; if the purchase went through, reconcile deposits it next tick.
        console.error("Ownership unknown after sweep — holding, no rebid");
        return Response.json({ ...result, executed: "SWEEP_UNCONFIRMED" });
      }

      if (!owned) {
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
      actions.push(...(await settle(k, conversionRate, maxPayWei, true)));
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
        const dead = await offchainCancel(client, openOrder);
        if (!dead) {
          // A seller may already hold a fulfilment signature for the old offer, so
          // posting the replacement now could let both fill. Wait it out: the old
          // order expires within the hour and the next tick re-evaluates.
          actions.push("reprice:deferred-vended-signature");
          return Response.json({ ...result, executed: "REPRICE_DEFERRED" });
        }
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
