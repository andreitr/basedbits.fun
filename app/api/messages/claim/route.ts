import { BBitsTokenAbi } from "@/app/lib/abi/BBitsToken.abi";
import { supabase } from "@/app/lib/supabase/client";
import { DBMessage } from "@/app/lib/types/types";
import { baseProvider } from "@/app/lib/Web3Configs";
import { Contract, parseUnits, Wallet } from "ethers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
        }

        // Get the message from the database
        const { data: message, error: messageError } = await supabase
            .from("messages")
            .select("*")
            .eq("id", id)
            .single();

        if (messageError || !message) {
            return NextResponse.json({ error: "Message not found" }, { status: 404 });
        }

        if (message?.txn_hash) {
            return NextResponse.json({ error: "Message already claimed" }, { status: 400 });
        }

        if (message?.expires_at && new Date(message.expires_at) < new Date()) {
            return NextResponse.json({ error: "Message has expired" }, { status: 400 });
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
                const tx = await contract.transfer(userData.address, rewardAmount);

                // Update message with transaction hash immediately
                const { data, error } = await supabase
                    .from("messages")
                    .update({ txn_hash: tx.hash })
                    .eq("id", id)
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
                console.error("Error sending tokens:", error);
                return NextResponse.json(
                    { error: "Failed to send tokens" },
                    { status: 500 },
                );
            }
        }

        // If no bounty, just update the hash with a random UUID
        const { data, error } = await supabase
            .from("messages")
            .update({ hash: crypto.randomUUID() })
            .eq("id", id)
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