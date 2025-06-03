import { Contract, JsonRpcProvider, Wallet } from "ethers";
import { baseTestnetRpcUrl } from "@/app/lib/Web3Configs";
import { AEYEAbi } from "@/app/lib/abi/AEYE.abi";

let provider: JsonRpcProvider | null = null;

const getProvider = (): JsonRpcProvider => {
  if (!provider) {
    provider = new JsonRpcProvider(baseTestnetRpcUrl);
  }
  return provider;
};

export const aeyeSepoliaContract = () => {
  const provider = getProvider();
  const signer = new Wallet(process.env.EXECUTER_BOT_PK as string, provider);
  return new Contract(
    process.env.NEXT_PUBLIC_AEYE_ADDRESS as string,
    AEYEAbi,
    signer,
  );
};
