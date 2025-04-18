import { ZeitgeistAbi } from "@/app/lib/abi/Zeitgeist.abi";
import { Contract, JsonRpcProvider, Wallet } from "ethers";
import { baseTestnetRpcUrl } from "../Web3Configs";

let provider: JsonRpcProvider | null = null;

const getProvider = (): JsonRpcProvider => {
  if (!provider) {
    provider = new JsonRpcProvider(baseTestnetRpcUrl);
  }
  return provider;
};

export const getZeitgeistBotContract = () => {
  const provider = getProvider();
  const signer = new Wallet(process.env.BACERACE_BOT_PK as string, provider);
  return new Contract(
    "0x553C1f87C2EF99CcA23b8A7fFaA629C8c2D27666",
    ZeitgeistAbi,
    signer,
  );
};
