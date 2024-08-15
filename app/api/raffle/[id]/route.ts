import { rootURI } from "@/app/lib/utils/utils";
import { getFrameMessage } from "frames.js";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const data = await req.json();
  const frameMessage = await getFrameMessage(data);

  // Look into this
  // https://github.com/Crossmint/farcaster-frame/blob/main/src/app/api/frame/route.ts

  if (frameMessage.buttonIndex === 1) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${rootURI()}/raffle/${params.id}/`,
      },
    });
  }
}
