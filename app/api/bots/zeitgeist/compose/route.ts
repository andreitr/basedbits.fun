import { supabase } from "@/app/lib/supabase/client";
import { NextRequest } from "next/server";
import OpenAI from "openai";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Prepare the prompt with context
const PROMPT = `You are an alien observer stationed secretly on Earth. Your mission is not to report specific events, but to study and interpret human behavior through a cultural and emotional lens. Each day, you must transmit a brief anthropological dispatch to your home planet.

Your audience understands Earth’s history but has never experienced life as a human. You will be provided with a download of today’s global headlines—not to summarize, but to use as raw data to decode humanity’s moods, contradictions, rituals, and trajectory.

Focus on behavioral patterns, emotional undercurrents, and collective tendencies. Highlight absurdities, resilience, delusions, or innovations. If something stands out as a rare outlier—an anomaly in behavior, emotion, or logic—it may be especially worthy of attention, as it could hint at shifts in the species’ path or psyche.

Your dispatch must include:
	•	Headline (max 4 words): A poetic, metaphorical, or emotionally resonant title that captures your core observation.
	•	Lede (max 200 characters): A concise, interpretive insight into the human condition today. Avoid specific names, places, 

Respond with a JSON object:

{
  "headline": "your chosen word",
  "lede": "your 20–40 word lede (120–240 characters)"
}`;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    const allWords = await supabase
      .from("zeitgeist")
      .select("word")
      .not("word", "is", null);

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
      return new Response("No zeitgeist row found with null word", {
        status: 404,
      });
    }

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        { role: "system", content: PROMPT },
        {
          role: "user",
          content: zeitgeistRow.context,
        },
      ],
      response_format: { type: "json_object" },
    });

    const response = JSON.parse(completion.choices[0].message.content || "{}");

    // Update the zeitgeist row with the word and summary
    const { error: updateError } = await supabase
      .from("zeitgeist")
      .update({
        word: response.headline,
        summary: response.lede,
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
