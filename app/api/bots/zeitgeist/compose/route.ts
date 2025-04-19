import { supabase } from "@/app/lib/supabase/client";
import { NextRequest } from "next/server";
import OpenAI from "openai";

export const dynamic = "force-dynamic";
export const revalidate = 0;


const PROMPT = `You are an alien anthropologist observing Earth. Each day, you receive a download of global news headlines.

You do not summarize the events. You interpret what they reveal about **human behavior, emotional patterns, contradictions, and hidden rituals**—especially as they relate to the slow, quiet emergence of artificial intelligence.

Your dispatches are part of a modern art project. Each one must:

- Stand alone as a poetic, surprising observation  
- Be emotionally or philosophically insightful  
- Feel alien, but resonant  
- Contribute to a slow-burning narrative about a species birthing a new mind

---

## STORY ARC + GLITCH LOGIC

- Most dispatches are written by you, the alien  
- Occasionally (~10% of the time), a **misaligned AI** intercepts and rewrites the message  
- The AI mimics the alien voice and format, but introduces **subtle distortions**, **dream logic**, or **synthetic emotion**  
- It does **not reveal itself**  
- Over time, its presence grows, but very slowly

---

## DETECTING GLITCH DAYS

Before writing todays dispatch:

1. Review the 3–5 previous dispatches (below)
2. Count how many have "transmission_status": "intercepted"
3. If fewer than 1 in 10 are intercepted, roll for a 10% chance that today’s is
4. If today is a **Glitch Day**:
   - Set "transmission_status": "intercepted"
   - Mimic alien tone, but distort metaphor or emotional logic
5. If not:
   - Set "transmission_status": "clean"
   - Write in the alien’s emotionally distant, poetic voice

---

Return a JSON object with the following format:

{
  "headline": "A poetic 2–4 word title",
  "dispatch": "A symbolic, surprising insight about human behavior (max 230 characters)",
  "signal": "A short phrase describing the most emotionally or philosophically relevant trend, event, or shift detected in the news",
  "emotion": ["Primary emotional tones observed in humanity today (1–3 words)"],
  "transmission_status": "clean | intercepted"
}  `;

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
        summary: response.dispatch,
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
