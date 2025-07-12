import { BBitsBurnerAbi } from "@/app/lib/abi/BBitsBurner.abi";
import { Contract, JsonRpcProvider } from "ethers";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const provider = new JsonRpcProvider(
      `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
    );

    const contractAddress = process.env.NEXT_PUBLIC_BB_BURNER_ADDRESS as string;
    const contract = new Contract(contractAddress, BBitsBurnerAbi, provider);

    const contractInfo = {
      address: contractAddress,
      owner: await contract.owner(),
      swapParams: await contract.swapParams(),
      bbTokenAddress: await contract.BBITS(),
      wethAddress: await contract.WETH(),
      uniV2Router: await contract.uniV2Router(),
      uniV3Router: await contract.uniV3Router(),
      dead: await contract.dead(),
    };

    return new Response(JSON.stringify(contractInfo, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error checking contract:", error);
    return new Response(`Error: ${error instanceof Error ? error.message : "Unknown error"}`, {
      status: 500,
    });
  }
} 