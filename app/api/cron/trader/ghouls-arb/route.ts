import { LUCKY_GHOULS_ADDRESS } from "@/app/lib/contracts/luckyghouls";
import { getGhoulsArbKeeper } from "@/app/lib/contracts/luckyGhoulsArb";
import {
  KEEPER_HOUR,
  KEEPER_TIME_ZONE,
  zonedTime,
} from "@/app/lib/luckyghouls/keeperSchedule";
import {
  type ArbCollection,
  type RestingOffer,
  BID_INCREMENT_WEI,
  collectHeldNfts,
  confirmCancelled,
  effectiveGasBuffer,
  findFloorListings,
  findRestingOffers,
  getOpenSeaClient,
  hardCancel,
  min,
  offchainCancel,
  postOffer,
  remainingOfferUnits,
  restingOfferQuantity,
  restingOfferUnitPriceWei,
} from "@/app/lib/trader/openseaArb";
import { Contract, formatEther, getAddress } from "ethers";
import { NextRequest } from "next/server";
import { Chain, OpenSeaSDK } from "opensea-js";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Lucky Ghouls redeem arbitrage. Every Ghoul can be burned for an equal share of the
// treasury (getBurnPayoutPerToken). The bot keeps a WETH collection offer below that
// share, sweeps listings under it, and burns whatever it acquires for the spread.
//
// Unlike BBITS there is no AMM leg: a burn turns the NFT into ETH in one transaction and
// doesn't move the per-token payout, so the bot can bid for several Ghouls at once. The
// payout only moves when the daily keeper (/api/cron/ghouls) buys tickets or claims
// winnings, so the bid is repriced once a day, right after it. The ticks in between
// burn fills, sweep, re-wrap the float and top the offer back up at the same price.
//
// Pricing uses the ETH share only. The USDC share a burn also pays stays in the wallet
// as extra margin.
//
// Pass ?reprice=1 to force the daily reprice outside its window.

// --- Strategy constants -----------------------------------------------------
// All figures are wei of ETH/WETH.

const MARGIN_BPS = BigInt(800); // 8% of the redeem price
const MIN_MARGIN_WEI = BigInt("10000000000000"); // 0.00001 ETH
const GAS_BUFFER_WEI = BigInt("5000000000000"); // 0.000005 ETH — floor; see effectiveGasBuffer()
const ESTIMATED_GAS = BigInt(300_000); // fulfil a listing + burn

// Ceiling on what the bot pays for one Ghoul, whatever the redeem price reads.
const MAX_SPEND_WEI = BigInt("1000000000000000"); // 0.001 ETH — ~6x redeem at launch

// The WETH the bot keeps on hand to fund its offer. The offer is sized to it: seed more
// WETH to bid on more Ghouls. Whatever a burn pays beyond restoring it is banked margin,
// held as native ETH. Set this to the amount actually seeded.
const TARGET_WETH_FLOAT_WEI = BigInt("5000000000000000"); // 0.005 ETH — seeded 2026-09-30 (0.005 WETH + 0.002 native)

// Native ETH kept on hand for gas. Topped up by unwrapping WETH, never below what a bid
// needs.
const NATIVE_GAS_RESERVE_WEI = BigInt("1000000000000000"); // 0.001 ETH

// Below this, a wrap or unwrap costs more gas than it moves.
const MIN_WORTHWHILE_WEI = GAS_BUFFER_WEI;

// Safety ceiling on units per offer, against a bad price read. The float is what sizes
// the offer in practice.
const MAX_UNITS = BigInt(20);

// Cheapest listings to buy in one run.
const MAX_SWEEPS_PER_RUN = 3;

// A resting offer this far above today's ceiling is repriced down on any tick, not
// just in the daily window: the redeem price fell (the keeper spent treasury on tickets)
// and the offer would otherwise fill with the margin gone.
const REPRICE_DOWN_TOLERANCE_BPS = BigInt(200); // 2% of the redeem price

// The keeper runs at 10:05 PT with a retry at 10:10. The cron ticks at :05/:20/:35/:50,
// so the tick that lands in [10:15, 10:30) PT is the first after both attempts.
const REPRICE_WINDOW_START_MINUTE = 15;
const REPRICE_WINDOW_END_MINUTE = 30;

// Long enough to outlive one missed daily reprice by a couple of hours, so the next
// window always finds and replaces it, and a dead cron leaves at most a day-old bid.
const OFFER_DURATION_SECONDS = 26 * 60 * 60;

type Keeper = ReturnType<typeof getGhoulsArbKeeper> & { bot: string };

const describe = (error: unknown) =>
  (error as { revert?: { name?: string } }).revert?.name ??
  (error as { shortMessage?: string }).shortMessage ??
  String(error);

// OpenSea keys the offer book by slug; resolved from the contract so it follows
// LUCKY_GHOULS_ADDRESS. Cached for the life of the function instance.
let cachedSlug: string | null = null;
const resolveCollection = async (
  client: OpenSeaSDK,
): Promise<ArbCollection> => {
  if (!cachedSlug) {
    const { nfts } = await client.api.getNFTsByContract(
      LUCKY_GHOULS_ADDRESS,
      1,
      undefined,
      Chain.Base,
    );
    const slug = nfts?.[0]?.collection;
    if (!slug) {
      throw new Error(
        `No OpenSea collection found for ${LUCKY_GHOULS_ADDRESS}`,
      );
    }
    cachedSlug = slug;
  }
  return { slug: cachedSlug, address: LUCKY_GHOULS_ADDRESS };
};

/**
 * Burn each Ghoul for its treasury share. Simulated first so a revert (nothing to
 * redeem, paused) is reported for that token and the rest still go through.
 */
const burnAll = async (k: Keeper, ids: string[]): Promise<string[]> => {
  const done: string[] = [];
  for (const id of ids) {
    try {
      await k.ghouls.burn.staticCall(id);
      const tx = await k.ghouls.burn(id);
      await tx.wait();
      done.push(`burn:${id}`);
    } catch (error) {
      console.error(`Burn of Ghoul #${id} failed:`, error);
      done.push(`burn-failed:${id}:${describe(error)}`);
    }
  }
  return done;
};

/**
 * Bring the balances back to their targets after burns and fills: fills pull WETH, burns
 * pay native ETH. Wrap native ETH above the gas reserve back into the WETH float; if gas
 * is short instead, unwrap WETH, but never below what one bid needs. Native ETH beyond
 * both targets is banked margin and stays put.
 */
const settle = async (k: Keeper, maxPayWei: bigint): Promise<string[]> => {
  const [wethBalance, nativeBalance]: bigint[] = await Promise.all([
    k.weth.balanceOf(k.bot),
    k.provider.getBalance(k.bot),
  ]);

  const spareNative =
    nativeBalance > NATIVE_GAS_RESERVE_WEI
      ? nativeBalance - NATIVE_GAS_RESERVE_WEI
      : BigInt(0);
  const wrap = min(TARGET_WETH_FLOAT_WEI - wethBalance, spareNative);
  if (wrap >= MIN_WORTHWHILE_WEI) {
    const tx = await k.weth.deposit({ value: wrap });
    await tx.wait();
    return [`settle:wrapped:${formatEther(wrap)}-eth`];
  }

  const gasDeficit = NATIVE_GAS_RESERVE_WEI - nativeBalance;
  if (gasDeficit < MIN_WORTHWHILE_WEI) return [];
  const surplus = wethBalance > maxPayWei ? wethBalance - maxPayWei : BigInt(0);
  const unwrap = min(gasDeficit, surplus);
  if (unwrap < MIN_WORTHWHILE_WEI) return [];
  const tx = await k.weth.withdraw(unwrap);
  await tx.wait();
  return [`settle:unwrapped:${formatEther(unwrap)}-eth`];
};

// Hard-cancel and confirm on-chain. Returns whether the order is certainly dead.
const cancelOnChain = async (
  client: OpenSeaSDK,
  k: Keeper,
  order: RestingOffer,
): Promise<boolean> => {
  await hardCancel(client, order, k.bot);
  return confirmCancelled(k.provider, order);
};

const ownsToken = async (
  k: Keeper,
  tokenId: string,
): Promise<boolean | null> => {
  try {
    const owner: string = await k.ghouls.ownerOf(tokenId);
    return getAddress(owner) === getAddress(k.bot);
  } catch {
    return null;
  }
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

    const keeper = getGhoulsArbKeeper();
    const bot = await keeper.signer.getAddress();
    const k: Keeper = { ...keeper, bot };
    const { provider, ghouls, weth } = k;
    const client = getOpenSeaClient(keeper.signer);
    const collection = await resolveCollection(client);
    const actions: string[] = [];

    const { hour, minute } = zonedTime(KEEPER_TIME_ZONE);
    const inRepriceWindow =
      req.nextUrl.searchParams.get("reprice") === "1" ||
      (hour === KEEPER_HOUR &&
        minute >= REPRICE_WINDOW_START_MINUTE &&
        minute < REPRICE_WINDOW_END_MINUTE);

    // --- Redeem price -------------------------------------------------------
    // Resting offers are loaded before any write, so whatever the run does next starts
    // from a known orderbook. A read failure fails the whole run closed.
    const [
      [redeemEthWei, redeemUsdc],
      totalSupply,
      paused,
      treasuryEthWei,
      gasBufferWei,
      heldNfts,
      restingOffers,
    ]: [
      [bigint, bigint],
      bigint,
      boolean,
      bigint,
      bigint,
      bigint,
      RestingOffer[],
    ] = await Promise.all([
      ghouls.getBurnPayoutPerToken(),
      ghouls.totalSupply(),
      ghouls.paused(),
      provider.getBalance(LUCKY_GHOULS_ADDRESS),
      effectiveGasBuffer(provider, ESTIMATED_GAS, GAS_BUFFER_WEI),
      ghouls.balanceOf(bot),
      findRestingOffers(client, collection, bot),
    ]);

    // Guard against a corrupted price read — the one failure that can overbid real
    // money. The payout per Ghoul can't be zero, and every Ghoul burning at it can't
    // pay out more ETH than the treasury holds. A paused contract can't be redeemed
    // against at all.
    const sane =
      redeemEthWei > BigInt(0) &&
      redeemEthWei * totalSupply <= treasuryEthWei &&
      !paused;
    if (!sane) {
      console.error(
        `Redeem price ${redeemEthWei} failed sanity (supply ${totalSupply}, treasury ${treasuryEthWei}, paused ${paused}) — skipping run`,
      );
      // An offer priced from an earlier redeem is no longer justifiable, so it is
      // cancelled on-chain before bailing. Nothing else is done on a suspect price.
      let cancelled = 0;
      for (const order of restingOffers) {
        if (await cancelOnChain(client, k, order)) cancelled++;
        else console.error("On-chain cancel unconfirmed during sanity abort");
      }
      return Response.json({
        ok: false,
        action: "ABORT_REDEEM_SANITY",
        redeemEthWei: redeemEthWei.toString(),
        totalSupply: totalSupply.toString(),
        treasuryEthWei: treasuryEthWei.toString(),
        paused,
        restingOffers: restingOffers.length,
        cancelled,
      });
    }

    // The most the bot will pay for one Ghoul, by either route, snapped down to
    // OpenSea's bid grid. Zero or less is unprofitable.
    const pctMargin = (redeemEthWei * MARGIN_BPS) / BigInt(10_000);
    const marginWei = pctMargin > MIN_MARGIN_WEI ? pctMargin : MIN_MARGIN_WEI;
    const maxProfitablePriceWei = redeemEthWei - marginWei - gasBufferWei;
    const gridPriceWei =
      maxProfitablePriceWei > BigInt(0)
        ? (min(maxProfitablePriceWei, MAX_SPEND_WEI) / BID_INCREMENT_WEI) *
          BID_INCREMENT_WEI
        : BigInt(0);
    const unprofitable = gridPriceWei <= BigInt(0);
    const maxPayWei = unprofitable ? BigInt(0) : gridPriceWei;

    // --- Step 0: reconcile --------------------------------------------------
    // Duplicates are an invariant violation: a reprice or top-up only replaces the
    // newest offer, so an older one must be certainly dead before anything is posted.
    if (restingOffers.length > 1) {
      actions.push(`recover:duplicate-offers:${restingOffers.length}`);
      for (const stale of restingOffers.slice(1)) {
        if (await offchainCancel(client, stale)) continue;
        if (!(await cancelOnChain(client, k, stale))) {
          console.error(
            "Duplicate offer could not be cancelled — aborting run",
          );
          return Response.json({
            ok: false,
            action: "ABORT_DUPLICATE_UNCANCELLED",
            actions,
            redeemEthWei: redeemEthWei.toString(),
          });
        }
        actions.push("recover:duplicate-hard-cancelled");
      }
    }
    const openOrder: RestingOffer | null = restingOffers[0] ?? null;

    // Burn every Ghoul the bot holds — filled bids, or a previous run that died between
    // buying and burning. Holding doesn't block bidding: a burn doesn't move the payout,
    // and Seaport can only pull as much WETH as the bot has, so fills are bounded by the
    // float however many land.
    const held = await collectHeldNfts(
      client,
      ghouls,
      LUCKY_GHOULS_ADDRESS,
      bot,
      heldNfts,
      "Ghouls",
    );
    if (held.length) actions.push(...(await burnAll(k, held)));
    actions.push(...(await settle(k, maxPayWei)));

    if (unprofitable) {
      // No price clears margin+gas. An offer posted under earlier conditions would fill
      // at exactly the loss this guard detected, so it is cancelled on-chain.
      if (openOrder) {
        actions.push("hold:cancel-unprofitable-offer");
        if (!(await cancelOnChain(client, k, openOrder))) {
          console.error("On-chain cancel unconfirmed while holding");
        }
      }
      return Response.json({
        ok: true,
        action: "HOLD",
        reason: "margin+gas exceeds redeem price",
        actions,
        redeemEthWei: redeemEthWei.toString(),
        gasBufferWei: gasBufferWei.toString(),
      });
    }

    // --- Step 1: sweep listings under the ceiling ---------------------------
    // The resting offer stays live: fills and sweeps both draw on the same balances, and
    // Seaport can't pull more WETH than the bot holds.
    const listings = (await findFloorListings(client, collection))
      .filter((l) => l.totalCostWei <= maxPayWei)
      .slice(0, MAX_SWEEPS_PER_RUN);
    for (const floor of listings) {
      const [wethAvailable, nativeAvailable]: bigint[] = await Promise.all([
        weth.balanceOf(bot),
        provider.getBalance(bot),
      ]);
      // Gas is always paid in native ETH, whichever currency the listing is priced in.
      const affordable =
        floor.currency === "weth"
          ? wethAvailable >= floor.totalCostWei &&
            nativeAvailable >= gasBufferWei
          : nativeAvailable >= floor.totalCostWei + gasBufferWei;
      if (!affordable) {
        actions.push(`sweep:unaffordable:${floor.tokenId}`);
        break;
      }

      try {
        await client.fulfillOrder({
          order: floor.listing,
          accountAddress: bot,
        });
      } catch (error) {
        // Not conclusive: the SDK can throw after the purchase was broadcast.
        console.error("Sweep fulfilment threw:", error);
      }

      // Ownership is the only source of truth. If it can't be read, stop sweeping —
      // a bought Ghoul is burned by the next tick's reconcile either way.
      const owned = await ownsToken(k, floor.tokenId);
      if (owned === null) {
        actions.push(`sweep:unconfirmed:${floor.tokenId}`);
        break;
      }
      if (!owned) {
        actions.push(`sweep:missed:${floor.tokenId}`);
        continue;
      }
      actions.push(`sweep:filled:${floor.tokenId}`);
      actions.push(...(await burnAll(k, [floor.tokenId])));
      actions.push(...(await settle(k, maxPayWei)));
    }

    // --- Step 2: decide on the offer ----------------------------------------
    const wethAvailable: bigint = await weth.balanceOf(bot);
    const nativeAvailable: bigint = await provider.getBalance(bot);

    // Units the float can honour at `unitPriceWei`, capped by the safety ceiling.
    const capacity = (unitPriceWei: bigint) =>
      unitPriceWei > BigInt(0)
        ? min(wethAvailable / unitPriceWei, MAX_UNITS)
        : BigInt(0);
    const units = capacity(maxPayWei);

    const openUnitPriceWei = openOrder
      ? restingOfferUnitPriceWei(openOrder)
      : BigInt(0);
    const openRemaining = openOrder
      ? await remainingOfferUnits(provider, openOrder)
      : BigInt(0);
    const repriceDownTolerance =
      (redeemEthWei * REPRICE_DOWN_TOLERANCE_BPS) / BigInt(10_000);

    let action: string;
    let reason: string;
    // The price and size of the offer to post, if any.
    let postUnitPriceWei = maxPayWei;
    let postUnits = units;

    if (!openOrder) {
      action = "BID";
      reason = "no resting offer";
    } else if (openUnitPriceWei > maxPayWei + repriceDownTolerance) {
      action = "REPRICE_DOWN";
      reason = "redeem price fell below the resting offer's margin";
    } else if (inRepriceWindow) {
      // The daily reprice always re-posts, so the offer tracks the post-drawing redeem
      // price and never reaches its expiry.
      action = "REPRICE";
      reason = "daily reprice after the drawing";
    } else if (
      openRemaining * BigInt(2) <= capacity(openUnitPriceWei) &&
      capacity(openUnitPriceWei) > openRemaining
    ) {
      // Fills have used up at least half the offer and the float has been restored:
      // re-post at the same price so the day's bid doesn't move between drawings.
      action = "TOP_UP";
      reason = "offer mostly filled";
      postUnitPriceWei = openUnitPriceWei;
      postUnits = capacity(openUnitPriceWei);
    } else {
      action = "HOLD";
      reason = "offer within tolerance";
    }

    const result = {
      ok: true,
      action,
      reason,
      actions,
      bot,
      collection: collection.slug,
      inRepriceWindow,
      redeemEthWei: redeemEthWei.toString(),
      redeemUsdc: redeemUsdc.toString(),
      gasBufferWei: gasBufferWei.toString(),
      maxProfitablePriceWei: maxProfitablePriceWei.toString(),
      maxPayWei: maxPayWei.toString(),
      maxPayEth: formatEther(maxPayWei),
      openOrderUnitPriceWei: openOrder ? openUnitPriceWei.toString() : null,
      openOrderQuantity: openOrder
        ? restingOfferQuantity(openOrder).toString()
        : null,
      openOrderRemaining: openOrder ? openRemaining.toString() : null,
      postUnitPriceWei: postUnitPriceWei.toString(),
      postUnits: postUnits.toString(),
      wethBalanceWei: wethAvailable.toString(),
      nativeBalanceWei: nativeAvailable.toString(),
    };

    // --- Step 3: execute ----------------------------------------------------
    if (action === "HOLD") {
      return Response.json({ ...result, executed: action });
    }

    // Checked before cancelling: a short float would otherwise trade a healthy resting
    // order for none at all. A REPRICE_DOWN still cancels, since the old price loses.
    if (postUnits < BigInt(1)) {
      if (openOrder && action === "REPRICE_DOWN") {
        if (!(await cancelOnChain(client, k, openOrder))) {
          console.error("On-chain cancel unconfirmed on reprice down");
        }
        actions.push("reprice:cancelled-no-float");
      }
      console.error("Insufficient WETH to fund a one-unit offer");
      return Response.json({ ...result, executed: "SKIP_INSUFFICIENT_WETH" });
    }

    if (openOrder) {
      const dead = await offchainCancel(client, openOrder);
      if (!dead) {
        if (action === "REPRICE_DOWN") {
          // The old price can't stand until a vended signature lapses — it fills at a
          // loss. Kill it on-chain.
          if (!(await cancelOnChain(client, k, openOrder))) {
            console.error("On-chain cancel unconfirmed on reprice down");
            return Response.json({
              ...result,
              executed: "REPRICE_CANCEL_UNCONFIRMED",
            });
          }
        } else {
          // A seller may already hold a fulfilment signature for the old offer. Wait it
          // out rather than stack a second offer on top; the next tick re-evaluates.
          actions.push("reprice:deferred-vended-signature");
          return Response.json({ ...result, executed: `${action}_DEFERRED` });
        }
      }
    }

    await postOffer(
      client,
      collection,
      bot,
      postUnitPriceWei,
      Number(postUnits),
      OFFER_DURATION_SECONDS,
    );
    actions.push(
      `offer:posted:${postUnits}x${formatEther(postUnitPriceWei)}-eth`,
    );

    return Response.json({ ...result, executed: action });
  } catch (error) {
    console.error("Error running Lucky Ghouls arbitrage:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
