import { Contract, getAddress, JsonRpcProvider, Wallet } from "ethers";
import { baseRpcUrl } from "@/app/lib/Web3Configs";
import { BasePaintRewardsAbi } from "@/app/lib/abi/BasePaintRewards.abi";

let provider: JsonRpcProvider | null = null;

const getProvider = (): JsonRpcProvider => {
  if (!provider) {
    provider = new JsonRpcProvider(baseRpcUrl);
  }
  return provider;
};

export const getBasePaintRewardsContract = () => {
  const provider = getProvider();
  const signer = new Wallet(process.env.BURNER_BOT_PK as string, provider);
  return new Contract(
    getAddress("0xaff1A9E200000061fC3283455d8B0C7e3e728161"),
    BasePaintRewardsAbi,
    signer,
  );
};
