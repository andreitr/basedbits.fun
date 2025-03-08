import { Contract, JsonRpcProvider, Wallet } from "ethers";
import { BaseRaceAbi } from "@/app/lib/abi/BaseRace.abi";
import { baseTestnetRpcUrl } from "../Web3Configs";

let provider: JsonRpcProvider | null = null;

const getProvider = (): JsonRpcProvider => {
  if (!provider) {
    provider = new JsonRpcProvider(baseTestnetRpcUrl);
  }
  return provider;
};

export const getBaseRaceBotContract = () => {
  const provider = getProvider();
  const signer = new Wallet(process.env.BACERACE_BOT_PK as string, provider);
  return new Contract(
    process.env.NEXT_PUBLIC_BASERACE_ADDRESS as string,
    BaseRaceAbi,
    signer,
  );
};
