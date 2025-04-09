import { NextRequest } from "next/server";
import { supabase } from "@/app/lib/supabase/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Define article type interface
interface NewsArticle {
    title: string;
    description: string;
    url: string;
    publishedAt: string;
    source: {
        name: string;
    };
    content?: string;
    urlToImage?: string;
    author?: string;
}

export async function GET(req: NextRequest) {
    try {
        // Get the News API key from environment variables
        const apiKey = process.env.NEWS_API_KEY;

        if (!apiKey) {
            return new Response("Error: NEWS_API_KEY environment variable not set", {
                status: 500,
            });
        }

        // Hard-coded values instead of taking from parameters
        const category = 'general'; // Fixed category
        const days = 1; // Fixed to 1 day

        // Calculate date for the past day
        const date = new Date();
        date.setDate(date.getDate() - days);
        const fromDate = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD

        // Fixed list of high-quality news domains
        const domains = 'cnn.com,nytimes.com,washingtonpost.com,nbcnews.com,foxnews.com,bbc.com,reuters.com,cbsnews.com,usatoday.com,apnews.com,theguardian.com,wsj.com,bloomberg.com';

        // Get top US headlines
        let url = `https://newsapi.org/v2/top-headlines?country=us&pageSize=100&apiKey=${apiKey}&category=${category}`;

        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
            },
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!response.ok) {
            return new Response("Error: Failed to fetch news", {
                status: response.status,
            });
        }

        const data = await response.json();

        // Filter articles by date
        const fromDateTimestamp = new Date(fromDate).getTime();
        data.articles = data.articles.filter((article: NewsArticle) => {
            const publishedDate = new Date(article.publishedAt).getTime();
            return publishedDate >= fromDateTimestamp;
        });

        data.totalResults = data.articles.length;

        // If we don't have enough results, supplement with the everything endpoint
        if (data.totalResults < 50) {
            const everythingUrl = `https://newsapi.org/v2/everything?domains=${domains}&language=en&pageSize=100&from=${fromDate}&sortBy=popularity&apiKey=${apiKey}`;

            const everythingResponse = await fetch(everythingUrl, {
                headers: {
                    "Content-Type": "application/json",
                },
                next: { revalidate: 3600 },
            });

            if (everythingResponse.ok) {
                const everythingData = await everythingResponse.json();

                // Combine results if we got any from top-headlines
                if (data.totalResults > 0) {
                    // Create a Set of existing titles to avoid duplicates
                    const existingTitles = new Set(data.articles.map((article: NewsArticle) => article.title));

                    // Add non-duplicate articles from everything endpoint
                    everythingData.articles.forEach((article: NewsArticle) => {
                        if (!existingTitles.has(article.title)) {
                            data.articles.push(article);
                            existingTitles.add(article.title);
                        }
                    });

                    // Update total results
                    data.totalResults = data.articles.length;
                } else {
                    // Just use everything results if top-headlines had none
                    data.articles = everythingData.articles;
                    data.totalResults = everythingData.totalResults;
                }
            }
        }

        // Format articles in the requested text format
        let formattedText = "";

        // Limit to 100 articles
        const limitedArticles = data.articles.slice(0, 100);

        for (const article of limitedArticles) {
            const title = article.title?.trim() || "Untitled";
            const description = article.description?.trim() || "[No description available]";

            formattedText += `Title: "${title}"\n`;
            formattedText += `Summary: "${description}"\n\n`;
        }

        // Save to zeitgeist table in the database
        const todayDate = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
        const { error: dbError } = await supabase
            .from("zeitgeist")
            .insert({
                context: formattedText
            });

        if (dbError) {
            console.error("Error saving to zeitgeist table:", dbError);
        }

        return new Response(formattedText, {
            status: 200,
            headers: {
                "Content-Type": "text/plain",
                "Cache-Control": "max-age=3600", // Cache for 1 hour
            },
        });
    } catch (error) {
        console.error("Error fetching news:", error);

        return new Response("Error: Failed to fetch news", {
            status: 500,
        });
    }
} 