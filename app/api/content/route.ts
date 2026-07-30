import { getStore } from "@/lib/db";

// Full content snapshot for client hydration. Not cached: CMS needs fresh reads.
// ponytail: public pages are a client SPA, so no ISR/revalidateTag consumer yet.
// When pages convert to RSC, wrap reads in unstable_cache(tag:'content') and
// revalidateTag on mutate — until then a client re-fetch is the freshness path.
export const dynamic = "force-dynamic";

export async function GET() {
  const store = await getStore();
  return Response.json(store);
}
