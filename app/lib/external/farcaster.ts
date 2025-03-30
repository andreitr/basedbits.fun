const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || "";
const NEYNAR_API_URL = "https://api.neynar.com/v2/farcaster";

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

export async function getFarcasterUserByUsername(
  username: string,
): Promise<FarcasterUser> {
  try {
    const response = await fetch(
      `${NEYNAR_API_URL}/user/search?q=${username}`,
      {
        headers: {
          accept: "application/json",
          "x-api-key": NEYNAR_API_KEY,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch Farcaster user by username: ${response.statusText} (${response.status})\nResponse: ${errorText}`,
      );
    }

    const data = await response.json();
    const user = data.result?.users?.[0];

    if (user?.username) {
      return {
        username: user.username,
        avatarUrl: user.pfp_url || null,
        fid: user.fid,
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching Farcaster user by username:", error);
    return null;
  }
}

export async function postToFarcaster(
  message: string,
  url?: string,
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
        ...(url ? { embeds: [{ url: url }] } : {}),
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

export async function sendFarcasterDM(
  username: string,
  message: string,
): Promise<boolean> {
  try {
    // Get the user's data using our new method
    const user = await getFarcasterUserByUsername(username);
    if (!user?.fid) {
      throw new Error("User not found");
    }

    const recipientFid = user.fid;

    // Send DM using Warpcast Programmable Direct Casts API
    const response = await fetch("https://api.warpcast.com/v2/ext-send-direct-cast", {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${process.env.FARCASTER_API_KEY || ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipientFid,
        message,
        idempotencyKey: crypto.randomUUID()
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const errorJson = JSON.parse(errorText);

      // Handle specific error cases
      if (errorJson.errors?.[0]?.message === "Conversation users must be different") {
        throw new Error("Cannot send DM to yourself");
      }

      throw new Error(
        `Failed to send Farcaster DM: ${response.statusText} (${response.status})\nResponse: ${errorText}`,
      );
    }

    return true;
  } catch (error) {
    console.error("Error sending Farcaster DM:", error);
    return false;
  }
}
