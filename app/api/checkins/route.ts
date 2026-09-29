import { getCheckins } from "@/app/lib/api/getCheckins";

export const dynamic = "force-dynamic";

// Last 24h of check-ins with their users; the home page polls this instead of bundling the Supabase client
export async function GET() {
  try {
    return Response.json(await getCheckins());
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Unable to load check-ins" },
      { status: 502 },
    );
  }
}
