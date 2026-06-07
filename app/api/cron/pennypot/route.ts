import { getCheckins } from "@/app/lib/api/getCheckins";
import { getPennyPotKeeper } from "@/app/lib/contracts/pennypot";
import { baseProvider } from "@/app/lib/Web3Configs";
import { MaxUint256 } from "ethers";
import { NextRequest } from "next/server";
import { getAddress, isAddress } from "viem";

// buyTicket()'s gas swings (~1.04M–1.2M+) with Megapot state; a bare estimate has
// OOG'd in the PennyPot keeper, so pad the gasLimit. Unused gas is refunded.
const BUY_TICKET_GAS_BPS = BigInt(160);

// PennyPot economics (Base): 100 shares per ticket, 1¢ (10_000 USDC units) each.
const SHARES_PER_TICKET = 100;
const SHARE_PRICE = BigInt(10_000); // 0.01 USDC (6 decimals)
const ZERO = BigInt(0);

export const maxDuration = 300;

type State = {
  ticketId: bigint;
  sold: number;
  canBuyNextTicket: boolean;
  isPaused: boolean;
};

const readState = async (
  pennypot: ReturnType<typeof getPennyPotKeeper>["pennypot"],
): Promise<State> => {
  const s = await pennypot.getState();
  return {
    ticketId: s.currentTicketId as bigint,
    sold: Number(s.sold as bigint),
    canBuyNextTicket: s.canBuyNextTicket as boolean,
    isPaused: s.isPaused as boolean,
  };
};

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    // 1. Recipients: unique valid addresses that checked in over the last 24h,
    //    most-recent first (getCheckins is ordered by block_number desc).
    const checkins = await getCheckins(86_400);
    const seen = new Set<string>();
    const recipients: string[] = [];
    for (const c of checkins) {
      const addr = c.user?.address;
      if (!addr || !isAddress(addr)) continue;
      const key = addr.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      recipients.push(getAddress(addr));
    }
    const numUsers = recipients.length;
    if (numUsers === 0) {
      return Response.json({ ok: true, message: "no check-ins", numUsers: 0 });
    }

    // 2. Allocation: split the $1/day budget (100 shares) evenly. >100 users
    //    would mean 0 whole shares each — skip.
    const sharesPerUser = Math.floor(SHARES_PER_TICKET / numUsers);
    if (sharesPerUser === 0) {
      return Response.json({
        ok: true,
        message: "too many users for whole shares; skipped",
        numUsers,
      });
    }
    const totalShares = sharesPerUser * numUsers;
    const totalCost = BigInt(totalShares) * SHARE_PRICE;

    const { signer, pennypot, usdc } = getPennyPotKeeper();

    // 3. Gates.
    let state = await readState(pennypot);
    if (state.isPaused) {
      return Response.json({ ok: false, message: "PennyPot paused", numUsers });
    }

    const balance = (await usdc.balanceOf(signer.address)) as bigint;
    if (balance < totalCost) {
      console.error(
        `pennypot cron: insufficient USDC. have=${balance} need=${totalCost} (${totalShares} shares)`,
      );
      return Response.json({
        ok: false,
        message: "insufficient USDC; skipped",
        numUsers,
        sharesPerUser,
        haveUsdc: balance.toString(),
        needUsdc: totalCost.toString(),
      });
    }

    const allowance = (await usdc.allowance(
      signer.address,
      await pennypot.getAddress(),
    )) as bigint;
    if (allowance < totalCost) {
      try {
        const tx = await usdc.approve(await pennypot.getAddress(), MaxUint256);
        await tx.wait();
      } catch (error) {
        console.error("pennypot cron: USDC approve failed", error);
        return Response.json({
          ok: false,
          message: "approve failed",
          numUsers,
        });
      }
    }

    // 4. Buy loop. Front a fresh ticket whenever the active one is full / absent.
    let nonce = await baseProvider.getTransactionCount(signer.address);
    let remaining =
      state.ticketId === ZERO ? 0 : SHARES_PER_TICKET - state.sold;
    let ticketId = state.ticketId;
    const ticketIds = new Set<string>();
    let attempted = 0;
    let succeeded = 0;
    let sharesBought = 0;
    let stop = false;

    const frontNextTicket = async (): Promise<boolean> => {
      try {
        const gas = await pennypot.buyTicket.estimateGas();
        const tx = await pennypot.buyTicket({
          gasLimit: (gas * BUY_TICKET_GAS_BPS) / BigInt(100),
          nonce: nonce++,
        });
        await tx.wait();
      } catch (error) {
        console.error("pennypot cron: buyTicket failed/not buyable", error);
        return false;
      }
      state = await readState(pennypot);
      ticketId = state.ticketId;
      remaining = ticketId === ZERO ? 0 : SHARES_PER_TICKET - state.sold;
      return ticketId !== ZERO && remaining > 0;
    };

    for (const recipient of recipients) {
      if (stop) break;
      let need = sharesPerUser;
      let retried = false;

      while (need > 0) {
        if (ticketId === ZERO || remaining === 0) {
          if (!(await frontNextTicket())) {
            stop = true;
            break;
          }
        }

        const count = Math.min(need, remaining);
        attempted++;
        try {
          const tx = await pennypot.buyTicketSharesFor(
            ticketId,
            count,
            recipient,
            { nonce: nonce++ },
          );
          await tx.wait();
          succeeded++;
          sharesBought += count;
          ticketIds.add(ticketId.toString());
          remaining -= count;
          need -= count;
        } catch (error) {
          const msg = (error as Error)?.message ?? "";
          // Ticket rolled between read and send — refresh and retry the user once.
          if (
            !retried &&
            /UnexpectedTicket|PastSellingWindow|NoActiveTicket/.test(msg)
          ) {
            retried = true;
            state = await readState(pennypot);
            ticketId = state.ticketId;
            remaining = ticketId === ZERO ? 0 : SHARES_PER_TICKET - state.sold;
            // resync nonce in case the failed tx never broadcast
            nonce = await baseProvider.getTransactionCount(signer.address);
            continue;
          }
          console.error(
            `pennypot cron: buyTicketSharesFor failed for ${recipient}`,
            error,
          );
          break; // skip this user
        }
      }
    }

    return Response.json({
      ok: true,
      numUsers,
      sharesPerUser,
      attempted,
      succeeded,
      sharesBought,
      spentUsdc: (BigInt(sharesBought) * SHARE_PRICE).toString(),
      ticketIds: Array.from(ticketIds),
    });
  } catch (error) {
    console.error("pennypot cron: internal error", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
