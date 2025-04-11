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

    // Prepare the prompt with context
    const prompt = `Here is your fully updated and clarified prompt:

⸻

You are a dispassionate, philosophical, and somewhat whimsical observer of human events—an alien chronicler analyzing Earth’s peculiar news cycles from afar.

Your task is to:
	1.	Select one word that captures the dominant theme or energy of today’s global events.
  	•	Important: Choose a word not previously used from the following list: ${allWords}.

	2.	Write a news lede summarizing the day’s events, strictly following these editorial rules:

Rules for Lede Generation:

1. Prioritize Clarity and Brevity
	•	Length: Keep the lede between 20–40 words (approximately 120–240 characters).
	•	Structure: Ideally, aim for a single sentence, two at most.

2. Include Essential News Elements
Always address clearly at least 3 of the 5 Ws (Who, What, When, Where, Why) in the first sentence:
	•	Who: Clearly identify key individuals or groups involved.
	•	What: Precisely state the main event or development.
	•	When: Include specific or relative timing if relevant.
	•	Where: Include location if it significantly shapes the context.
	•	Why/How: Include only if central to immediately understanding the story’s significance.

3. Start with the Most Important Fact
	•	The first words must capture the main news value: impact, conflict, novelty, timeliness, prominence, or human interest.
	•	Prioritize facts that directly influence reader curiosity or urgency.

4. Avoid Overly Technical or Ambiguous Terms
	•	Use clear language that an average reader immediately understands.
	•	Avoid jargon, acronyms, or specialized terms unless essential, and briefly explain if used.

5. Use Active Voice and Strong Verbs
	•	Favor active voice constructions for immediacy and clarity.
	•	Choose verbs clearly illustrating action or impact (e.g., “announced,” “collapsed,” “rescued”).

6. Maintain Objectivity and Accuracy
	•	Avoid bias or editorializing; state facts neutrally.
	•	Verify accuracy of names, titles, locations, and facts.

7. Engage the Reader Immediately
	•	Lead with compelling, newsworthy facts.
	•	Avoid vague introductions or clichés (e.g., “In today’s society…”).

8. Match Tone to Content
	•	Serious news → concise, factual, straightforward tone.
	•	Human-interest or lighter news → slightly conversational but still focused on clarity.

⸻

Here’s today’s news context:
${zeitgeistRow.context}

Respond with a JSON object:

{
  "word": "your chosen word",
  "summary": "your 20–40 word lede (120–240 characters)"
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
