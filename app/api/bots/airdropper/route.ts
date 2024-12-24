import {NextRequest} from "next/server";
import {Contract, JsonRpcProvider, parseUnits, Wallet} from "ethers";
import {BBitsBurnerAbi} from "@/app/lib/abi/BBitsBurner.abi";

const INDEX_SUPPLY_PATH = "https://api.indexsupply.net/query?query=select+%0A++sender%2C+%0A++timestamp%0Afrom+checkin%0Awhere+address+%3D+0xE842537260634175891925F058498F9099C102eB%0Aorder+by+2+desc+limit+100%3B&event_signatures=CheckIn%28address+indexed+sender%2C+uint256+timestamp%29&event_signatures=&chain=8453&network=mainnet&variables=%7B%7D";


export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new Response("Unauthorized", {
                status: 401,
            });
        }

        const json = await fetch(INDEX_SUPPLY_PATH).then((res) => res.json());
        const filteredEvents = filterRecentUniqueEvents(json.result);

        const provider = new JsonRpcProvider(
            `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
        );

        const signer = new Wallet(process.env.BURNER_BOT_PK as string, provider);

        const contract = new Contract(
            process.env.NEXT_PUBLIC_BB_BURNER_ADDRESS as string,
            BBitsBurnerAbi,
            signer,
        );



        const burnAmount = parseUnits("0.0004", 18);

        await contract.burn(burnAmount, {
            value: burnAmount,
        });

        return new Response("Burned", {
            status: 200,
        });
    } catch (error) {
        return new Response("Internal Server Error", {
            status: 500,
        });
    }
}


function filterRecentUniqueEvents(events: any[]): string[] {
    const currentTime = Math.floor(Date.now() / 1000);
    const oneDayInSeconds = 24 * 60 * 60;
    const uniqueAddresses: Set<string> = new Set();

    for (const event of events.slice(1)) {
        const [sender, timestamp] = event;
        if (currentTime - parseInt(timestamp) <= oneDayInSeconds) {
            uniqueAddresses.add(sender);
        }
    }

    return Array.from(uniqueAddresses);
}