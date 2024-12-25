import {NextRequest} from "next/server";
import {Contract, JsonRpcProvider, parseUnits, Wallet} from "ethers";
import {getRecentCheckIns} from "@/app/lib/api/getRecentCheckIns";
import {BBitsTokenAbi} from "@/app/lib/abi/BBitsToken.abi";
import {isAddress} from "viem";

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new Response("Unauthorized", {
                status: 401,
            });
        }

        const checkins = await getRecentCheckIns();

        if (checkins.length === 0) {
            return new Response("No recent check-ins found", {status: 200});
        }

        const reward = 100 / checkins.length;
        const rewardAmount = parseUnits(reward.toString(), 18);

        const provider = new JsonRpcProvider(
            `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
        );

        const signer = new Wallet(process.env.AIRDROP_BOT_PK as string, provider);

        const contract = new Contract(
            process.env.NEXT_PUBLIC_BB_TOKEN_ADDRESS as string,
            BBitsTokenAbi,
            signer,
        );

        let nonce = await provider.getTransactionCount(signer.address);


        for (const checkin of checkins) {
            if (isAddress(checkin)) {
                try {
                    console.log(`Airdopping ${reward} BBITS to `, checkin);
                    await contract.transfer(checkin, rewardAmount, {nonce: nonce++});

                } catch (error) {
                    console.error("Failed to transfer to", checkin, "Error:", error);
                }
            } else {
                console.log("Invalid address:", checkin);
            }
        }

        return new Response("Daily airdrop sent", {
            status: 200,
        });
    } catch (error) {
        return new Response("Internal Server Error", {
            status: 500,
        });
    }
}
