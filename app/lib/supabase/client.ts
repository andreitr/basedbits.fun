import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type for our users table
export interface User {
  created_at: string;
  updated_at: string;
  address: string;
  ens_name?: string;
  ens_avatar?: string;
  farcaster_name?: string;
  farcaster_avatar?: string;
}

// Helper function to get or create a user
export async function getOrCreateUser(address: string): Promise<User | null> {
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
  if (user) return user as User;

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

  return newUser as User;
}
