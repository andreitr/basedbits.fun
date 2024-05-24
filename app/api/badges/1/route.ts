import {NextResponse} from "next/server";

export async function GET(request: Request) {

    return NextResponse.json(
        {
            name: "Based Bits OG",
            description: "This badge is awarded for checking into the home base during the first week! You are a true Based Bits OG!",
            image: "https://www.basedbits.fun/images/badges/001.png",
            tokenId: "1",
            attributes: [
                {
                    trait_type: "artist",
                    value: "numo.eth"
                },
            ]
        });
};