import { NextResponse } from "next/server";

export async function GET(request: Request) {
  return NextResponse.json({
    name: "7 Day Streak",
    description:
      "This badge is awarded for reaching the 7-day check-in streak! Welcome to the 7-day club, fren — you clicked your way to the first streak badge!",
    image: "https://www.basedbits.fun/images/badges/002.png",
    tokenId: "2",
    attributes: [
      {
        trait_type: "artist",
        value: "numo.eth",
      },
    ],
  });
}
