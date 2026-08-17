import { unstable_cache } from "next/cache";
import { getStore } from "@/lib/db";

// Full content snapshot for client hydration. Cached (tag "content") since the
// payload embeds large base64 images and Neon's HTTP driver adds per-query
// latency — recomputing on every load was the slow path. /api/mutate calls
// revalidateTag("content") after every write, so CMS edits still show up
// immediately.
const getCachedStore = unstable_cache(() => getStore(), ["content"], { tags: ["content"] });

export async function GET() {
  const store = await getCachedStore();
  return Response.json(store);
}
