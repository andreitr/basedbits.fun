import { baseProvider } from "@/app/lib/Web3Configs";
import { PennyPotABI } from "@/app/lib/abi/PennyPot.abi";
import { Contract, Wallet } from "ethers";

// Base mainnet USDC (6 decimals). PennyPot shares are priced in USDC.
export const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

// Live PennyPot deployment on Base. Defaulted in code (not just env) because
// NEXT_PUBLIC_* vars are inlined at build time — a missing/late env var would
// leave the Contract target undefined at runtime. Override via env if needed.
// Mirrors andreitr/pennypot packages/web/lib/addresses.ts.
export const PENNYPOT_ADDRESS =
  process.env.NEXT_PUBLIC_PENNYPOT_ADDRESS ??
  "0x133195CEd7Cf71A7ed3a428a30816d83f022C9A1";

// Minimal ERC20 surface the cron needs: read balance/allowance, approve PennyPot.
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
] as const;

// The check-in rewards cron pays for shares from the existing BBITS airdrop
// wallet (AIRDROP_BOT_PK). buyTicketSharesFor / buyTicket are permissionless,
// so the bot only needs USDC + ETH (gas), not the contract owner role.
export const getPennyPotKeeper = () => {
  const pk = process.env.AIRDROP_BOT_PK;
  if (!pk) throw new Error("AIRDROP_BOT_PK is not set");

  const signer = new Wallet(pk, baseProvider);
  const pennypot = new Contract(PENNYPOT_ADDRESS, PennyPotABI, signer);
  const usdc = new Contract(USDC_ADDRESS, ERC20_ABI, signer);
  return { signer, pennypot, usdc };
};
