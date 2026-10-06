import { baseProvider } from "@/app/lib/ethersProviders";
import { EvilOddsABI } from "@/app/lib/abi/EvilOdds.abi";
import { WETH_ADDRESS } from "@/app/lib/contracts/bbitsVault";
import { EVIL_ODDS_ADDRESS } from "@/app/lib/contracts/evilodds";
import { Contract, Wallet } from "ethers";

const WETH_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  // Seaport pulls offer fills through OpenSea's conduit; see ensureConduitAllowance.
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  // Wrap the native ETH a burn pays out back into the WETH the bid is funded from.
  "function deposit() payable",
  // Unwrap to native ETH when the gas reserve runs low.
  "function withdraw(uint256 amount)",
] as const;

// Dedicated wallet, deliberately NOT EXECUTER_BOT_PK (the ghouls keeper) or
// BBITS_ARB_BOT_PK: sharing either would collide on nonces and mix this bot's WETH float
// with unrelated balances.
export const getGhoulsArbKeeper = () => {
  const pk = process.env.GHOULS_ARB_BOT_PK;
  if (!pk) throw new Error("GHOULS_ARB_BOT_PK is not set");

  const signer = new Wallet(pk, baseProvider);
  return {
    signer,
    provider: baseProvider,
    ghouls: new Contract(EVIL_ODDS_ADDRESS, EvilOddsABI, signer),
    weth: new Contract(WETH_ADDRESS, WETH_ABI, signer),
  };
};
