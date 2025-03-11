import { truncateAddress } from "@/app/lib/utils/addressUtils";

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || "";
const NEYNAR_API_URL = "https://api.neynar.com/v2/farcaster";

export interface FarcasterUser {
  username: string;
  displayName: string;
  address: string;
}

export async function getFarcasterUsername(
  address: string,
): Promise<string | null> {
  try {
    const response = await fetch(
      `${NEYNAR_API_URL}/user/bulk?addresses=${address}`,
      {
        headers: {
          api_key: NEYNAR_API_KEY,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch Farcaster user: ${response.statusText}`);
    }

    const data = await response.json();
    const user = data.users?.[0];

    if (user && user.username) {
      return user.username;
    }

    return null;
  } catch (error) {
    console.error("Error fetching Farcaster username:", error);
    return null;
  }
}

export async function postToFarcaster(message: string): Promise<boolean> {
  try {
    const response = await fetch(`${NEYNAR_API_URL}/cast`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        api_key: NEYNAR_API_KEY,
      },
      body: JSON.stringify({
        signer_uuid: process.env.FARCASTER_BASEDBITS_UUID,
        text: message,
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

export function formatCheckInMessage(
  address: string,
  username: string | null,
  streak: number,
): string {
  const displayName = username ? `@${username}` : truncateAddress(address);
  return `${displayName} just checked in! 🔥 Streak: ${streak}`;
}
