import { getStore } from "@/lib/db";

// Full content snapshot for client hydration. NOT wrapped in unstable_cache:
// the payload embeds base64 images and exceeds the data cache's 2MB item cap,
// which threw on every write. Served straight from Neon instead.
// ponytail: no cross-request cache → every load hits Neon. Real fix is to stop
// embedding base64 images in the store (serve via <Image>/blob URLs); then the
// slimmed payload fits the 2MB cap and unstable_cache(tags:["content"]) works
// again with revalidateTag on mutate.
export async function GET() {
  const store = await getStore();
  return Response.json(store);
}
