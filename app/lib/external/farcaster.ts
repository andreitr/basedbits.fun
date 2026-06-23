import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || "";
const NEYNAR_API_URL = "https://api.neynar.com/v2/farcaster";
const neynarClient = new NeynarAPIClient(
  new Configuration({ apiKey: NEYNAR_API_KEY }),
);

type FarcasterUser = {
  username: string;
  avatarUrl: string | null;
  fid?: number;
} | null;

export async function getFarcasterUser(
  address: string,
): Promise<FarcasterUser> {
  try {
    const normalizedAddress = address.toLowerCase();

    const response = await fetch(
      `${NEYNAR_API_URL}/user/bulk-by-address?addresses=${normalizedAddress}`,
      {
        headers: {
          accept: "application/json",
          "x-neynar-experimental": "false",
          "x-api-key": NEYNAR_API_KEY,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();

      if (response.status === 404) {
        console.info(
          "Farcaster user not found for address, skipping update",
          normalizedAddress,
        );
        return null;
      }

      throw new Error(
        `Failed to fetch Farcaster user: ${response.statusText} (${response.status})\nResponse: ${errorText}`,
      );
    }

    const data = await response.json();
    const users = data[normalizedAddress];

    if (users && users.length > 0 && users[0].username) {
      return {
        username: users[0].username,
        avatarUrl: users[0].pfp_url || null,
        fid: users[0].fid,
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching Farcaster user:", error);
    return null;
  }
}

export async function postToFarcaster(
  message: string,
  url?: string,
  imageUrl?: string,
): Promise<boolean> {
  try {
    let embeds: { url: string }[] = [];

    // Handle URL embed if provided
    if (url) {
      embeds.push({ url });
    }

    // Handle image embed if provided
    if (imageUrl) {
      embeds.push({ url: imageUrl });
    }

    const response = await fetch(`${NEYNAR_API_URL}/cast`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "x-api-key": NEYNAR_API_KEY,
      },
      body: JSON.stringify({
        signer_uuid: process.env.FARCASTER_BASEDBITS_UUID,
        text: message,
        channel_id: "basedbits",
        embeds: embeds.length > 0 ? embeds : undefined,
        idem: crypto.randomUUID(),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to post to Farcaster: ${response.statusText}\nResponse: ${errorText}`,
      );
    }

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("Error posting to Farcaster:", error);
    return false;
  }
}
