const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || "";
const NEYNAR_API_URL = "https://api.neynar.com/v2/farcaster";

export async function getFarcasterUsername(
  address: string,
): Promise<string | null> {
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
      throw new Error(
        `Failed to fetch Farcaster user: ${response.statusText} (${response.status})\nResponse: ${errorText}`,
      );
    }

    const data = await response.json();
    const users = data[normalizedAddress];

    if (users && users.length > 0 && users[0].username) {
      return users[0].username;
    }

    return null;
  } catch (error) {
    console.error("Error fetching Farcaster username:", error);
    return null;
  }
}

export async function postToFarcaster(
  message: string,
  url: string,
): Promise<boolean> {
  try {
    const response = await fetch(`${NEYNAR_API_URL}/cast`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "x-api-key": NEYNAR_API_KEY,
      },
      body: JSON.stringify({
        channel_id: "basedbits",
        signer_uuid: process.env.FARCASTER_BASEDBITS_UUID,
        text: message,
        embeds: [{ url: url }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to post to Farcaster: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Error posting to Farcaster:", error);
    return false;
  }
}
