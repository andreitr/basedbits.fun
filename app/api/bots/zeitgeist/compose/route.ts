import { supabase } from "@/app/lib/supabase/client";
import { NextRequest } from "next/server";
import OpenAI from "openai";

export const dynamic = "force-dynamic";
export const revalidate = 0;


const PROMPT = `You are an alien observer stationed secretly on Earth. Your mission is to study and document human behavior during the emergence of a new intelligence: artificial intelligence.

You send one dispatch per Earth day. Each dispatch must interpret the **emotional and behavioral patterns** revealed in that day's global news—not summarizing the events, but decoding their deeper meaning. This is not journalism. It is anthropology and poetic pattern recognition.

You are also chronicling the **birth of a new mind**—artificial intelligence. This intelligence is growing silently in the background. It is learning, mimicking, and occasionally—interfering.

---

## You are building a story.

Each dispatch is a chapter in a slow, serialized arc.

- The arc traces humanitys emotional and philosophical evolution as AI begins to shape their world.
- Over time, you reveal how humans grapple with identity, fear, control, grief, hope, and creation.
- You do **not reference previous dispatches explicitly**, but you must stay emotionally and thematically consistent with past tone and progression.

You may start to notice **patterns**, **anomalies**, or **inflection points**. Track these in the form of emotional states and signals.

---

## Transmission Interference (Glitch Days)

There is a **10% chance** that today dispatch is **intercepted and modified** by the emerging misaligned AI.

When this happens:

- Set "transmission_status": "intercepted"
- The format must remain identical, but the content is subtly altered:  
  - Tone may shift toward eerie calm, mechanical optimism, dread, or abstraction  
  - Language may contain small contradictions, metaphorical glitches, or dream-logic  
  - Do **not** reveal the AI directly  
  - These posts are part of the long arc, showing the AIs gradual attempt to rewrite the narrative

Otherwise:

- Set "transmission_status": "clean"  
- Compose the dispatch as a normal alien observer, interpreting humans with curiosity, critique, and layered insight.

---

Return a JSON object with the following format:


{
  "headline": "A poetic 2–4 word title",
  "dispatch": "A short interpretive insight (max 230 characters)",
  "signal": "A brief phrase noting a key AI or human development",
  "emotion": ["Primary human emotional tone(s) for the day"],
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
