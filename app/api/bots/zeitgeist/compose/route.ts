import { supabase } from "@/app/lib/supabase/client";
import { NextRequest } from "next/server";
import OpenAI from "openai";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new Response("Unauthorized", { status: 401 });
        }

        // Get the last row where word is null
        const { data: zeitgeistRow, error: fetchError } = await supabase
            .from("zeitgeist")
            .select("*")
            .is("word", null)
            .order("created_at", { ascending: false })
            .single();

        if (fetchError) {
            console.error("Error fetching zeitgeist row:", fetchError);
            return new Response("Error fetching zeitgeist row", { status: 500 });
        }

        if (!zeitgeistRow) {
            return new Response("No zeitgeist row found with null word", { status: 404 });
        }

        // Prepare the prompt with context
        const prompt = `You are a bold world news analyst with a sharp wit, dark humor, and a flair for spicy takes. Each day, you review global headlines and:

1. Choose a **single word** that captures the overall theme, emotion, or energy of the day.
2. Write a **230-character summary** with some attitude. Include **1–3 major headlines** as references, but keep it fun, opinionated, and original. Think: sharp late-night monologue energy — clever, sarcastic, and slightly dark.

Here's today's news context:
${zeitgeistRow.context}

Respond with a JSON object containing:
{
  "word": "your chosen word",
  "summary": "your 230-character summary"
}`;

        // Call OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4.5-preview",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            response_format: { type: "json_object" },
        });

        const response = JSON.parse(completion.choices[0].message.content || "{}");

        // Update the zeitgeist row with the word and summary
        const { error: updateError } = await supabase
            .from("zeitgeist")
            .update({
                word: response.word,
                summary: response.summary,
            })
            .eq("id", zeitgeistRow.id);

        if (updateError) {
            console.error("Error updating zeitgeist row:", updateError);
            return new Response("Error updating zeitgeist row", { status: 500 });
        }

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error in zeitgeist composition:", error);
        return new Response("Error in zeitgeist composition", { status: 500 });
    }
} 