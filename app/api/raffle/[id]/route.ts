import {getFrameMessage} from "frames.js";
import {NextResponse} from "next/server";

export async function POST(
    req: Request,
    {params}: { params: { id: string } },
) {

    const data = await req.json();
    const message = await getFrameMessage(data, {fetchHubContext: false});

    const btnIdx = message?.buttonIndex || 0;

    if (btnIdx === 1) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/raffle/${params.id}/`, {status: 302},)
    }
}
