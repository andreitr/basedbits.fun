import {NextResponse} from "next/server";

export async function GET(request: Request) {

    return NextResponse.json(
        {
            name: "First Click OG",
            description: "This badge is awarded for checking into the Based Bits home base during the first week of the check-ins release. If you can mint this badge, you are a true check-in OG!",
            image: "https://www.basedbits.fun/images/badges/001.png",
            tokenId: "1",
            attributes: [
                {
                    trait_type: "artist",
                    value: "numo.eth"
                }
            ]
        });
};