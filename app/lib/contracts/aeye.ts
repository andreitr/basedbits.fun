
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

export const aeyeSepoliaContract = () => {
  const provider = getProvider();
  const signer = new Wallet(process.env.BACERACE_BOT_PK as string, provider);
  return new Contract(
    process.env.AEYE_CONTRACT_ADDRESS as string,
    AEYEAbi,
    signer,
  );
};
