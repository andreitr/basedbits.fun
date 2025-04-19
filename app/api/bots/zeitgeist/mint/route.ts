import { getZeitgeistBotContract } from "@/app/lib/contracts/zeitgeist";
import { supabase } from "@/app/lib/supabase/client";
import { DBZeitgeist } from "@/app/lib/types/types";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
    try {
        // Verify authorization
        const authHeader = req.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new Response("Unauthorized", { status: 401 });
        }

        // Get the latest zeitgeist entry
        const { data, error } = await supabase
            .from("zeitgeist")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(1);

        if (error) {
            console.error("Error fetching zeitgeist:", error);
            return new Response("Error fetching latest zeitgeist entry", { status: 500 });
        }

        if (!data || data.length === 0) {
            return new Response("No zeitgeist entries found", { status: 404 });
        }

        const latestZeitgeist = data[0] as DBZeitgeist;
        const { word, summary } = latestZeitgeist;

        if (!word || !summary) {
            return new Response("Invalid zeitgeist data: missing word or summary", { status: 400 });
        }

        // Generate SVG
        const svg = generateSvg(word, summary);

        // Convert SVG to base64
        const base64Svg = Buffer.from(svg).toString('base64');
        const encodedSvg = `data:image/svg+xml;base64,${base64Svg}`;

        // Create metadata
        const metadata = JSON.stringify({
            name: `Zeitgeist: ${word}`,
            description: summary,
            image: encodedSvg,
            attributes: [
                {
                    trait_type: "Word",
                    value: word
                },
                {
                    trait_type: "Created",
                    value: new Date().toISOString()
                }
            ]
        });

        // Get contract and mint token
        const contract = getZeitgeistBotContract();
        const tx = await contract.createToken(encodedSvg, metadata);
        await tx.wait();

        return new Response(`Successfully minted Zeitgeist token for word: ${word}`, {
            status: 200,
        });
    } catch (error) {
        console.error("Error minting zeitgeist token:", error);
        return new Response(`Error: Failed to mint token: ${error}`, { status: 500 });
    }
}

function generateSvg(word: string, summary: string): string {
    // Truncate summary if too long
    const truncatedSummary = summary.length > 300
        ? summary.substring(0, 297) + "..."
        : summary;

    // Escape XML entities
    const escapedWord = word.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
    const escapedSummary = truncatedSummary.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

    // Split summary into lines for better text display (avoiding foreignObject which can cause compatibility issues)
    const lines = splitTextIntoLines(escapedSummary, 40);

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">
        <rect width="500" height="500" fill="#000" />
        <text x="250" y="80" font-family="Arial" font-size="32" font-weight="bold" fill="#fff" text-anchor="middle">${escapedWord}</text>`;

    // Add summary text line by line
    lines.forEach((line, index) => {
        svgContent += `
        <text x="50" y="${140 + index * 20}" font-family="Arial" font-size="14" fill="#fff">${line}</text>`;
    });

    svgContent += `
    </svg>`;

    // Return properly encoded SVG
    return svgContent;
}

// Helper function to split text into lines of appropriate length
function splitTextIntoLines(text: string, maxCharsPerLine: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
        if ((currentLine + word).length <= maxCharsPerLine) {
            currentLine += (currentLine === '' ? '' : ' ') + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    });

    if (currentLine) {
        lines.push(currentLine);
    }

    // Limit to maximum of 15 lines to ensure it fits in the SVG
    return lines.slice(0, 15);
}
