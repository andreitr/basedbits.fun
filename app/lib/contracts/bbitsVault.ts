import { baseProvider } from "@/app/lib/Web3Configs";
import { BBitsTokenAbi } from "@/app/lib/abi/BBitsToken.abi";
import { QuoterV2Abi } from "@/app/lib/abi/QuoterV2.abi";
import { Contract, Wallet } from "ethers";

// The BBITS token IS the NFT vault: one contract that mints `conversionRate`
// tokens per deposited Based Bit and burns them on redemption. Verified on-chain:
// totalSupply == count() * conversionRate(), i.e. BBITS is exactly 100% NFT-backed.
export const BBITS_VAULT = "0x553C1f87C2EF99CcA23b8A7fFaA629C8c2D27666";

// == vault.collection(). An EIP-1167 minimal proxy: ownerOf/balanceOf/setApprovalForAll
// work, but supportsInterface REVERTS, so never ERC165-probe it and never assume
// ERC721Enumerable (no tokenOfOwnerByIndex).
export const BBITS_COLLECTION = "0x617978b8af11570c2dAb7c39163A8bdE1D282407";

export const WETH_ADDRESS = "0x4200000000000000000000000000000000000006";
export const QUOTER_V2_ADDRESS = "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a";
export const SWAP_ROUTER_02_ADDRESS =
  "0x2626664c2603336E57B271c5C0b26F421741e481";

// BBITS/WETH exists only at the 0.3% tier — the 0.05% and 1% pools revert.
export const POOL_FEE = 3000;

export const COLLECTION_SLUG = "based-bits";

// Hardcoded rather than read from NEXT_PUBLIC_* env vars: those are inlined at build
// time and resolve to undefined in server-only cron code. Same reasoning as pennypot.ts.

const ERC721_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function setApprovalForAll(address operator, bool approved)",
] as const;

const WETH_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
] as const;

// SwapRouter02 structs carry NO deadline field — 7 members each.
const SWAP_ROUTER_02_ABI = [
  "function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96) params) payable returns (uint256 amountOut)",
  "function exactOutputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 amountOut, uint256 amountInMaximum, uint160 sqrtPriceLimitX96) params) payable returns (uint256 amountIn)",
] as const;

// Dedicated wallet, deliberately NOT the shared TRADER_BOT_PK: that key is used by
// trader/mint (20:00) and trader/list (20:05) and would collide on nonces, share an ETH
// float, and expose unrelated BBITS holdings to this bot's swap leg.
export const getBbitsArbKeeper = () => {
  const pk = process.env.BBITS_ARB_BOT_PK;
  if (!pk) throw new Error("BBITS_ARB_BOT_PK is not set");

  const signer = new Wallet(pk, baseProvider);
  return {
    signer,
    provider: baseProvider,
    vault: new Contract(BBITS_VAULT, BBitsTokenAbi, signer),
    collection: new Contract(BBITS_COLLECTION, ERC721_ABI, signer),
    weth: new Contract(WETH_ADDRESS, WETH_ABI, signer),
    swapRouter: new Contract(
      SWAP_ROUTER_02_ADDRESS,
      SWAP_ROUTER_02_ABI,
      signer,
    ),
    quoter: new Contract(QUOTER_V2_ADDRESS, QuoterV2Abi, baseProvider),
  };
};

// WETH received for selling `amountIn` BBITS (exact-input quote).
//
// NOTE on scaling: conversionRate() is ALREADY 18-decimal scaled (1024e18), so callers
// feed it straight in as amountIn. Multiplying it by a per-token price — or parseUnits-ing
// it — overstates the result by 1e18.
export const quoteWethForBbits = async (
  quoter: Contract,
  amountIn: bigint,
): Promise<bigint> => {
  const [amountOut] = await quoter
    .getFunction("quoteExactInputSingle")
    .staticCall({
      tokenIn: BBITS_VAULT,
      tokenOut: WETH_ADDRESS,
      amountIn,
      fee: POOL_FEE,
      sqrtPriceLimitX96: 0,
    });

  // Throw rather than return a falsy price: a zero/undefined read is the one failure
  // mode that can make the bot overbid with real money.
  if (!amountOut || amountOut <= BigInt(0)) {
    throw new Error("Quoter returned a non-positive BBITS quote");
  }
  return amountOut as bigint;
};

// Parity: what one NFT's worth of BBITS is currently worth in WETH.
export const quoteParityWei = (quoter: Contract, conversionRate: bigint) =>
  quoteWethForBbits(quoter, conversionRate);

// How many BBITS must be sold to receive exactly `amountOutWei` of WETH.
export const quoteBbitsForExactWeth = async (
  quoter: Contract,
  amountOutWei: bigint,
): Promise<bigint> => {
  const [amountIn] = await quoter
    .getFunction("quoteExactOutputSingle")
    .staticCall({
      tokenIn: BBITS_VAULT,
      tokenOut: WETH_ADDRESS,
      amount: amountOutWei,
      fee: POOL_FEE,
      sqrtPriceLimitX96: 0,
    });

  if (!amountIn || amountIn <= BigInt(0)) {
    throw new Error("Quoter returned a non-positive exact-output BBITS amount");
  }
  return amountIn as bigint;
};
