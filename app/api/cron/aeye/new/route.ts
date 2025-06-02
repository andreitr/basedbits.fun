import { supabase } from "@/app/lib/supabase/client";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NEWS_CATEGORY = "general";
const DAYS_TO_FETCH = 1;
const QUALITY_NEWS_DOMAINS =
  "cnn.com,nytimes.com,washingtonpost.com,nbcnews.com,foxnews.com,bbc.com,reuters.com,cbsnews.com,usatoday.com,apnews.com,theguardian.com,wsj.com,bloomberg.com,techcrunch.com,theverge.com,wired.com,engadget.com,arstechnica.com,zdnet.com,venturebeat.com,cnet.com";
const TOP_HEADLINES_ENDPOINT = "https://newsapi.org/v2/top-headlines";
const EVERYTHING_ENDPOINT = "https://newsapi.org/v2/everything";

interface NewsArticle {
  title: string;
  description: string;
  publishedAt: string;
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Check if a row with "new" status already exists
    const { data: existingRow } = await supabase
      .from("aeye")
      .select("id")
      .eq("status", "new")
      .single();

    if (existingRow) {
      return new Response("A row with 'new' status already exists", {
        status: 200,
      });
    }

    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) {
      return new Response("Error: NEWS_API_KEY not set", { status: 500 });
    }

    // Calculate date range
    const date = new Date();
    date.setDate(date.getDate() - DAYS_TO_FETCH);
    const fromDate = date.toISOString().split("T")[0];

    const articles = await fetchAllArticles(apiKey, fromDate);
    const formattedText = formatArticles(articles);

    await supabase.from("aeye").insert({
      context: formattedText,
    });

    return new Response(`Saved ${articles.length} news headlines`, {
      status: 200,
    });
  } catch (error: any) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}

async function fetchAllArticles(
  apiKey: string,
  fromDate: string,
): Promise<NewsArticle[]> {
  // Get top headlines
  const headlinesUrl = `${TOP_HEADLINES_ENDPOINT}?country=us&pageSize=100&apiKey=${apiKey}&category=${NEWS_CATEGORY}`;
  const headlinesResponse = await fetch(headlinesUrl, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!headlinesResponse.ok) {
    throw new Error(`Failed to fetch headlines: ${headlinesResponse.status}`);
  }

  const headlinesData = await headlinesResponse.json();

  // Get additional articles
  const everythingUrl = `${EVERYTHING_ENDPOINT}?domains=${QUALITY_NEWS_DOMAINS}&language=en&pageSize=100&from=${fromDate}&sortBy=popularity&apiKey=${apiKey}`;
  const everythingResponse = await fetch(everythingUrl, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!everythingResponse.ok) {
    // If this fails, still return headline results
    return headlinesData.articles;
  }

  const everythingData = await everythingResponse.json();

  // Combine and deduplicate articles
  const allArticles = [...headlinesData.articles];
  const existingTitles = new Set(allArticles.map((article) => article.title));

  everythingData.articles.forEach((article: NewsArticle) => {
    if (!existingTitles.has(article.title)) {
      allArticles.push(article);
      existingTitles.add(article.title);
    }
  });

  return allArticles;
}

function formatArticles(articles: NewsArticle[]): string {
  let formattedText = "";

  for (const article of articles) {
    const title = article.title?.trim() || "Untitled";
    const description =
      article.description?.trim() || "[No description available]";

    formattedText += `Title: "${title}"\n`;
    formattedText += `Summary: "${description}"\n\n`;
  }

  return formattedText;
}
