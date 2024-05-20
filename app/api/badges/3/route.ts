import {NextResponse} from "next/server";

export async function GET(request: Request) {

    return NextResponse.json(
        {
            name: "Bear Punk",
            description: "Do you hold a Bear Punk and you have a 7 Day Streak? Then this badge is yours! Welcome to the home base, fren.",
            image: "https://ipfs.raribleuserdata.com/ipfs/QmRqqnZsbMLJGWt8SWjP2ebtzeHtWv5kkz3brbLzY1ShHt/5709.png",
            tokenId: "3",
            attributes: [
                {
                    trait_type: "artist",
                    value: "numo.eth"
                },
            ]
        });
};