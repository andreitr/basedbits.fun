import { baseTestnetRpcUrl } from "@/app/lib/Web3Configs";
import { PotRaiderABI } from "@/app/lib/abi/PotRaider.abi";
import { Contract, JsonRpcProvider, Wallet } from "ethers";

let provider: JsonRpcProvider | null = null;

const getProvider = (): JsonRpcProvider => {
  if (!provider) {
    provider = new JsonRpcProvider(baseTestnetRpcUrl);
  }
  return provider;
};

export const potraiderContract = () => {
  const provider = getProvider();
  const signer = new Wallet(process.env.EXECUTER_BOT_PK as string, provider);
  return new Contract(
    process.env.NEXT_PUBLIC_RAIDER_ADDRESS as string,
    PotRaiderABI,
    signer,
  );
};
