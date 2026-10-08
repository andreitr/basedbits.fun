import { WETH_ADDRESS } from "@/app/lib/contracts/bbitsVault";
import {
  Contract,
  ContractRunner,
  Wallet,
  formatEther,
  getAddress,
} from "ethers";
import { Chain, OpenSeaSDK, type OrderV2, type ProtocolData } from "opensea-js";

// Shared OpenSea plumbing for the vault arbitrage bots (bbits-arb, odds-arb): finding
// the bot's own collection offers, pricing the floor, and posting/cancelling bids.

// The collection a bot trades: OpenSea's slug for the offer book, and the ERC721
// address the signed Seaport items must actually point at.
export type ArbCollection = { slug: string; address: string };

// OpenSea rejects offers that aren't a whole multiple of 0.0001 ETH per unit, so the
// bid is rounded down to this grid. Rounding down keeps it under the profit ceiling.
export const BID_INCREMENT_WEI = BigInt("100000000000000"); // 0.0001 ETH

// Pages of the collection offer book to walk when looking for the bot's own bids.
const MAX_OFFER_PAGES = 20;

// Pages of the OpenSea account index to walk when looking for held NFTs.
// Spam NFTs are routine on Base, so a real holding can sit well past page one.
const MAX_NFT_PAGES = 10;

// Seaport ItemType for an ERC721 consideration resolved by merkle criteria — the
// shape of every collection offer.
const ERC721_WITH_CRITERIA = 4;

const SEAPORT_ABI = [
  "function getOrderStatus(bytes32 orderHash) view returns (bool isValidated, bool isCancelled, uint256 totalFilled, uint256 totalSize)",
] as const;

export type GasProvider = ContractRunner & {
  getFeeData: () => Promise<{ maxFeePerGas: bigint | null }>;
};

export const getOpenSeaClient = (signer: Wallet) =>
  new OpenSeaSDK(signer, {
    chain: Chain.Base,
    apiKey: process.env.OPENSEA_API_KEY,
  });

const parameters = (protocolData: ProtocolData | undefined) =>
  protocolData?.parameters;

export const min = (a: bigint, b: bigint) => (a < b ? a : b);

// Current fee * estimated gas, never below `floorWei`.
export const effectiveGasBuffer = async (
  provider: GasProvider,
  estimatedGas: bigint,
  floorWei: bigint,
): Promise<bigint> => {
  try {
    const { maxFeePerGas } = await provider.getFeeData();
    const dynamic = (maxFeePerGas ?? BigInt(0)) * estimatedGas;
    return dynamic > floorWei ? dynamic : floorWei;
  } catch {
    return floorWei;
  }
};

/**
 * The subset of an OpenSea order the run needs: enough to price it, cancel it on- or
 * off-chain, and confirm the cancel. Built from the collection offer feed rather than
 * the SDK's `OrderV2`, whose backing endpoint (`/orders/{chain}/{protocol}/offers`)
 * OpenSea has removed (it now answers 405).
 */
export type RestingOffer = Pick<
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
export const findRestingOffers = async (
  client: OpenSeaSDK,
  collection: ArbCollection,
  maker: string,
): Promise<RestingOffer[]> => {
  const nowSec = BigInt(Math.floor(Date.now() / 1000));
  const makerAddress = getAddress(maker);
  const found: { offer: RestingOffer; startTime: bigint }[] = [];

  let next: string | undefined;
  for (let page = 0; page < MAX_OFFER_PAGES; page++) {
    const response = await client.api.getAllOffers(collection.slug, 100, next);
    for (const offer of response.offers) {
      const params = offer.protocol_data?.parameters;
      if (!params) continue;
      if (getAddress(params.offerer) !== makerAddress) continue;
      if (BigInt(params.endTime) <= nowSec) continue;

      // Collection (criteria) offers only — the bots never bid on a single token.
      // Read off the signed Seaport item rather than the API's optional `criteria`
      // field: an ERC721_WITH_CRITERIA consideration is what a collection offer is.
      const item = params.consideration?.[0];
      if (!item || Number(item.itemType) !== ERC721_WITH_CRITERIA) continue;
      if (getAddress(item.token) !== getAddress(collection.address)) continue;

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

// The exact WETH the bot has committed across every unit of the offer, read off the
// Seaport offer item rather than `currentPrice`, which is a derived display value.
export const restingOfferPriceWei = (order: RestingOffer): bigint =>
  BigInt(parameters(order.protocolData)?.offer?.[0]?.startAmount ?? 0);

// How many NFTs the offer was signed for: the criteria item's amount.
export const restingOfferQuantity = (order: RestingOffer): bigint => {
  const units = BigInt(
    parameters(order.protocolData)?.consideration?.[0]?.startAmount ?? 1,
  );
  return units > BigInt(0) ? units : BigInt(1);
};

// WETH per NFT: the offer amount covers every unit, so divide it back out.
export const restingOfferUnitPriceWei = (order: RestingOffer): bigint =>
  restingOfferPriceWei(order) / restingOfferQuantity(order);

/**
 * Units of a multi-unit offer still open to sellers. Seaport tracks partial fills as a
 * fraction (totalFilled / totalSize) of the whole order, so the remaining units are
 * that fraction's complement times the signed quantity. A never-filled order reports
 * totalSize 0.
 */
export const remainingOfferUnits = async (
  provider: ContractRunner,
  order: RestingOffer,
): Promise<bigint> => {
  const quantity = restingOfferQuantity(order);
  if (!order.orderHash) return quantity;
  const seaport = new Contract(order.protocolAddress, SEAPORT_ABI, provider);
  const [, isCancelled, totalFilled, totalSize]: [
    boolean,
    boolean,
    bigint,
    bigint,
  ] = await seaport.getOrderStatus(order.orderHash);
  if (isCancelled) return BigInt(0);
  if (totalSize === BigInt(0)) return quantity;
  return (quantity * (totalSize - totalFilled)) / totalSize;
};

export type Floor = {
  listing: Awaited<
    ReturnType<OpenSeaSDK["api"]["getBestListings"]>
  >["listings"][number];
  totalCostWei: bigint;
  // Which balance the purchase draws from. Seaport pays ERC20 listings from WETH.
  currency: "native" | "weth";
  tokenId: string;
};

/**
 * Fulfillable listings, cheapest first, each priced by summing the Seaport
 * consideration — that sum, not the headline `price`, is what the buyer actually pays.
 */
export const findFloorListings = async (
  client: OpenSeaSDK,
  collection: ArbCollection,
): Promise<Floor[]> => {
  const { listings } = await client.api.getBestListings(collection.slug, 20);
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
  return priced;
};

// Cheapest genuinely fulfillable listing.
export const findBestFloor = async (
  client: OpenSeaSDK,
  collection: ArbCollection,
): Promise<Floor | null> =>
  (await findFloorListings(client, collection))[0] ?? null;

/**
 * Token ids of `collection` the bot holds.
 *
 * Neither traded collection is ERC721Enumerable, so ids come from OpenSea's account
 * index. That index lags and paginates, so every page is walked and every candidate
 * is re-confirmed on-chain with ownerOf.
 */
export const collectHeldNfts = async (
  client: OpenSeaSDK,
  nft: Contract,
  collectionAddress: string,
  bot: string,
  heldCount: bigint,
  label: string,
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
        (item) => getAddress(item.contract) === getAddress(collectionAddress),
      )
      .map((item) => item.identifier);

    // Confirm each page on-chain before deciding whether to keep walking. The index
    // can still list a token the bot already disposed of, so counting raw candidates
    // would stop pagination early while the token actually held sits on a later page.
    const owners = await Promise.allSettled(
      candidates.map((id) => nft.ownerOf(id)),
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
      `Holding ${heldCount} ${label} but resolved ${owned.length} ids — OpenSea index lag, retrying next run`,
    );
  }
  return owned;
};

/**
 * Gasless cancel via OpenSea's SignedZone. Returns whether the order is now certainly
 * unfillable. The zone cannot revoke a fulfilment signature it has already handed to
 * a seller; the API reports how long such a signature stays valid, and until then the
 * old order can still fill.
 */
export const offchainCancel = async (
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
 * Post a WETH collection offer for `quantity` NFTs at `unitPriceWei` each.
 *
 * The SDK's `amount` is the TOTAL for every unit, and in ETH UNITS, not wei: it runs
 * it through parseUnits(amount, 18) internally. Passing wei would post an offer 1e18x
 * too large; passing the unit price for a multi-unit offer would bid 1/quantity of it.
 */
export const postOffer = async (
  client: OpenSeaSDK,
  collection: ArbCollection,
  bot: string,
  unitPriceWei: bigint,
  quantity: number,
  durationSeconds: number,
) => {
  await client.createCollectionOffer({
    collectionSlug: collection.slug,
    accountAddress: bot,
    amount: formatEther(unitPriceWei * BigInt(quantity)),
    quantity,
    paymentTokenAddress: WETH_ADDRESS,
    expirationTime: Math.floor(Date.now() / 1000) + durationSeconds,
    offerProtectionEnabled: true, // SignedZone — the precondition for gasless cancel
    // OpenSea rejects offers that carry optional creator fees; the fulfiller decides.
    excludeOptionalCreatorFees: true,
  });
};

/**
 * On-chain Seaport cancel. The SDK types this against `OrderV2` but only reads the
 * protocol address and the signed order parameters, both of which a RestingOffer
 * carries, hence the cast.
 */
export const hardCancel = async (
  client: OpenSeaSDK,
  order: RestingOffer,
  accountAddress: string,
) => {
  await client.cancelOrder({ order: order as OrderV2, accountAddress });
};

// The SDK awaits its own confirmation, but that wrapper is soft. Read the canonical
// on-chain status before spending, using the order's own protocol address.
export const confirmCancelled = async (
  provider: ContractRunner,
  order: RestingOffer,
): Promise<boolean> => {
  if (!order.orderHash) return false;
  const seaport = new Contract(order.protocolAddress, SEAPORT_ABI, provider);
  const [, isCancelled] = await seaport.getOrderStatus(order.orderHash);
  return isCancelled === true;
};
