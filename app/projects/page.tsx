import { PageChrome } from "@/components/site/Chrome";
import { getProjects } from "@/lib/db";
import { ProjectsView } from "./ProjectsView";

// Read published projects from Neon at request time so the public grid ships
// in the SSR HTML — no dependency on a client fetch that could stall/fail and
// leave the page blank. force-dynamic: always reflect the latest CMS edits.
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const published = (await getProjects())
    .filter((p) => p.published)
    .sort((a, b) => a.sortIndex - b.sortIndex)
    .map((p, i) => ({ ...p, sortIndex: i }));

  return (
    <PageChrome>
      <ProjectsView projects={published} />
    </PageChrome>
  );
}
