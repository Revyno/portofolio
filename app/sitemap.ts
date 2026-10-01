import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getProjects } from "@/lib/db";

// Static pages + every published project. Regenerated at most hourly so newly
// published projects reach the sitemap without a redeploy (ISR, not build-frozen).
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = ["", "/about", "/projects", "/journey", "/contact"].map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: p === "" ? 1 : 0.7,
  }));

  let projects: MetadataRoute.Sitemap = [];
  try {
    projects = (await getProjects())
      .filter((p) => p.published)
      .map((p) => ({
        url: `${SITE_URL}/projects/${p.slug}`,
        lastModified: new Date(p.updatedAt),
        changeFrequency: "monthly",
        priority: 0.6,
      }));
  } catch {
    // DB unreachable — still serve the static pages rather than 500 the sitemap.
  }

  return [...pages, ...projects];
}
