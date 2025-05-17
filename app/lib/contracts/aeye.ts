
import { Contract, JsonRpcProvider, Wallet } from "ethers";
import { baseTestnetRpcUrl } from "../Web3Configs";
import { AEYEAbi } from "../abi/AEYE.abi";

let provider: JsonRpcProvider | null = null;

const getProvider = (): JsonRpcProvider => {
  if (!provider) {
    provider = new JsonRpcProvider(baseTestnetRpcUrl);
  }
  return provider;
};

export const getAEYEContract = () => {
  const provider = getProvider();
  const signer = new Wallet(process.env.BACERACE_BOT_PK as string, provider);
  return new Contract(
    "0xE969De9A34C2010D87701BDC392c261cd78EA640",
    AEYEAbi,
    signer,
  );
};
