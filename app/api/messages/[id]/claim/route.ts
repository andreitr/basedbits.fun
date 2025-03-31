import { BBitsTokenAbi } from "@/app/lib/abi/BBitsToken.abi";
import { supabase } from "@/app/lib/supabase/client";
import { DBMessage } from "@/app/lib/types/types";
import { baseProvider } from "@/app/lib/Web3Configs";
import { Contract, parseUnits, Wallet } from "ethers";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const messageId = params.id;

    // Get the message from the database
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .select("*")
      .eq("id", messageId)
      .single();

    if (messageError || !message) {
      console.error("Error fetching message:", messageError);
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Get the user's address from the database
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("address")
      .eq("id", message.user_id)
      .single();

    if (userError || !userData) {
      console.error("Error fetching user:", userError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (message.bounty) {
      try {
        const signer = new Wallet(
          process.env.AIRDROP_BOT_PK as string,
          baseProvider,
        );

        const contract = new Contract(
          process.env.NEXT_PUBLIC_BB_TOKEN_ADDRESS as string,
          BBitsTokenAbi,
          signer,
        );

        const rewardAmount = parseUnits(message.bounty.toString(), 18);
        await contract.transfer(userData.address, rewardAmount);
      } catch (error) {
        console.error("Error sending tokens:", error);
        return NextResponse.json(
          { error: "Failed to send tokens" },
          { status: 500 },
        );
      }
    }

    // Update message only after successful token transfer
    const { data, error } = await supabase
      .from("messages")
      .update({ opened_at: new Date().toISOString() })
      .eq("id", messageId)
      .select()
      .single();

    if (error) {
      console.error("Error claiming message:", error);
      return NextResponse.json(
        { error: "Failed to claim message" },
        { status: 500 },
      );
    }

    return NextResponse.json(data as DBMessage);
  } catch (error) {
    console.error("Error processing claim request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
