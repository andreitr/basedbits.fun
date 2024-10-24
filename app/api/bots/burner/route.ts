import { ethers, JsonRpcProvider, parseUnits, Wallet } from "ethers";
import { BBitsBurnerAbi } from "@/app/lib/abi/BBitsBurner.abi";

const provider = new JsonRpcProvider(
  `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
);
const signer = new Wallet(
  process.env.NEXT_PUBLIC_BURNER_BOT_PK as string,
  provider,
);

const contractAddress = process.env.NEXT_PUBLIC_BB_BURNER_ADDRESS as string;
const contract = new ethers.Contract(contractAddress, BBitsBurnerAbi, signer);

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }

    const minAmountToBurn = parseUnits("0.0001", 18);

    contract.burn(minAmountToBurn, {
      value: minAmountToBurn,
    });

    return new Response(JSON.stringify({ status: "burned" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Internal Server Error", {
      status: 500,
    });
  }
}
