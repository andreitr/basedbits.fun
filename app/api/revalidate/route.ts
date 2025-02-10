import { revalidateTag } from "next/cache";

export async function POST(req: Request) {
  const data = await req.json();
  const tags = data.tags;

  if (Array.isArray(tags)) {
    for (const tag of tags) {
      revalidateTag(tag);
    }
  }

  return new Response("Revalidated", {
    status: 200,
  });
}
