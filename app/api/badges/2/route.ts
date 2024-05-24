import {NextResponse} from "next/server";

export async function GET(request: Request) {

    return NextResponse.json(
        {
            name: "7 Day Streak",
            description: "This badge is awarded for checking into basedbits.fun for 7 days in a row.",
            image: "https://www.basedbits.fun/images/badges/002.png",
            tokenId: "2",
            attributes: [
                {
                    trait_type: "artist",
                    value: "numo.eth"
                },
            ]
        });
};