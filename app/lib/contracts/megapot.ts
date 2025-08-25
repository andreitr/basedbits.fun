import { baseProvider } from "@/app/lib/Web3Configs";
import { MegapotABI } from "@/app/lib/abi/Megapot.abi";
import { Contract, Wallet } from "ethers";

export const megapotContract = () => {
  const signer = new Wallet(process.env.BURNER_BOT_PK as string, baseProvider);
  return new Contract(
    "0xbEDd4F2beBE9E3E636161E644759f3cbe3d51B95",
    MegapotABI,
    signer,
  );
};
