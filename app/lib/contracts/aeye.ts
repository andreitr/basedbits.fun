import { baseRpcUrl } from "@/app/lib/Web3Configs";
import { AEYEAbi } from "@/app/lib/abi/AEYE.abi";
import { Contract, JsonRpcProvider, Wallet } from "ethers";

let provider: JsonRpcProvider | null = null;

const getProvider = (): JsonRpcProvider => {
  if (!provider) {
    provider = new JsonRpcProvider(baseRpcUrl);
  }
  return provider;
};

export const aeyeContract = () => {
  const provider = getProvider();
  const signer = new Wallet(process.env.EXECUTER_BOT_PK as string, provider);
  return new Contract(
    process.env.NEXT_PUBLIC_AEYE_ADDRESS as string,
    AEYEAbi,
    signer,
  );
};
