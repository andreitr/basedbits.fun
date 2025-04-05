import { createClient } from "@supabase/supabase-js";
import { DBMessage, DBUser } from "../types/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to get or create a user
export async function getOrCreateUser(address: string): Promise<DBUser | null> {
  const normalizedAddress = address.toLowerCase();

  // First try to get the user
  let { data: user, error: selectError } = await supabase
    .from("users")
    .select("*")
    .eq("address", normalizedAddress)
    .single();

  if (selectError && selectError.code !== "PGRST116") {
    // PGRST116 is "not found"
    console.error("Error fetching user:", selectError);
    return null;
  }

  // If user exists, return it
  if (user) return user as DBUser;

  // If user doesn't exist, create it
  const { data: newUser, error: insertError } = await supabase
    .from("users")
    .insert([{ address: normalizedAddress }])
    .select()
    .single();

  if (insertError) {
    console.error("Error creating user:", insertError);
    return null;
  }

  return newUser as DBUser;
}

// Helper function to update a user
export async function updateUser(
  address: string,
  updates: Partial<DBUser>,
): Promise<DBUser | null> {
  const normalizedAddress = address.toLowerCase();

  const { data: updatedUser, error } = await supabase
    .from("users")
    .update(updates)
    .eq("address", normalizedAddress)
    .select()
    .single();

  if (error) {
    console.error("Error updating user:", error);
    return null;
  }

  return updatedUser as DBUser;
}

// Helper function to create a checkin record
export async function createCheckin(
  userId: number,
  streak: number,
  count: number,
  hash: string,
  blockNumber: number,
  blockTimestamp: number,
): Promise<boolean> {
  const { error } = await supabase.from("checkins").insert([
    {
      user_id: userId,
      streak,
      count,
      hash,
      block_number: blockNumber,
      block_timestamp: blockTimestamp,
    },
  ]);

  if (error) {
    console.error("Error creating checkin:", error);
    return false;
  }

  return true;
}

// Helper function to create a message record
export async function createMessage(
  userId: number,
  bounty?: number,
  hash?: string,
): Promise<DBMessage | null> {
  const { data: message, error } = await supabase
    .from("messages")
    .insert([
      {
        user_id: userId,
        bounty,
        hash,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating message:", error);
    return null;
  }

  return message as DBMessage;
}
