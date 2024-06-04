import { NextResponse } from "next/server";

export async function GET(request: Request) {
  return NextResponse.json({
    name: "Based Bits Badges",
    description: "Check in to the home base to earn badges!",
    image: "https://www.basedbits.fun/images/badges/001.png",
    banner_image: "",
    featured_image: "https://www.basedbits.fun/images/badges/001.png",
    external_link: "https://basedbits.fun",
    collaborators: ["0x1d671d1B191323A38490972D58354971E5c1cd2A"],
  });
}
