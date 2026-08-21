"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useParams } from "next/navigation";
import { PageChrome } from "@/components/site/Chrome";
import { Shell, Section, Eyebrow, MetaStrip, MetricTile, Button } from "@/components/site/primitives";
import { Code } from "@/components/site/Terminal";
import { Diagram } from "@/components/site/Diagram";
import { ProjectRow } from "@/components/site/ProjectRow";
import { SplitReveal, Reveal, Parallax } from "@/components/site/motion";
import { useProjects, publicProjects } from "@/lib/store";
import { playClick } from "@/lib/sound";
import type { Project } from "@/lib/data";

/** Simple index-based carousel — gallery is capped at 5 images, no library needed. */
function Gallery({ media, name }: { media: Project["media"]; name: string }) {
  const [i, setI] = useState(0);
  if (media.length === 0) return null;
  const go = (d: number) => setI((n) => (n + d + media.length) % media.length);

  return (
    <Shell>
      <div className="relative aspect-[16/9] w-full overflow-hidden border border-[var(--line-box)]">
        <Image src={media[i].url} alt={media[i].caption || name} fill sizes="1440px" className="object-cover" />
        {media.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="mono absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 px-3 py-2 text-white transition-colors hover:bg-black/85"
            >
              ←
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next image"
              className="mono absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 px-3 py-2 text-white transition-colors hover:bg-black/85"
            >
              →
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
              {media.map((m, j) => (
                <button
                  key={m.id}
                  onClick={() => setI(j)}
                  aria-label={`Go to image ${j + 1}`}
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${j === i ? "bg-accent" : "bg-white/40"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}

export default function CaseStudyPage() {
  const params = useParams<{ slug: string }>();
  const list = publicProjects(useProjects());
  const idx = list.findIndex((p) => p.slug === params.slug);
  const project = list[idx];

  if (!project) {
    return (
      <PageChrome>
        <Shell>
          <Section border={false} className="pt-24">
            <h1 className="text-[clamp(2.75rem,8vw,92px)] font-bold tracking-[-0.05em] text-white">
              Not found
            </h1>
            <p className="mt-4 text-[15px] text-[var(--t-body)]">
              This case study is unpublished or does not exist.
            </p>
            <Button href="/projects" variant="ghost" className="mt-8">
              ← All projects
            </Button>
          </Section>
        </Shell>
      </PageChrome>
    );
  }

  const next = list[(idx + 1) % list.length];

  // Problem section: CMS-editable per project; fall back to the default copy when blank.
  const problemTitle = project.problemTitle?.trim() || "Updates meant a deploy.";
  const problemBody = project.problemBody?.trim()
    ? project.problemBody.trim().split(/\n\s*\n/)
    : [
        "Every content change was a developer task: edit a file, commit, wait for CI, deploy. The result was stale content — new work never landed, and the CV on the site drifted from the one sent to recruiters.",
        "The fix was a content layer the owner drives from a browser, with the visual system held rigid so nothing can break the layout.",
      ];

  return (
    <PageChrome>
      <Shell>
        <Section border={false} className="pt-12 md:pt-20">
          <Link href="/projects" onClick={playClick} className="mono text-[11px] uppercase tracking-[0.14em] text-[var(--t-muted)] hover:text-white">
            ← Projects
          </Link>
          <Eyebrow className="mt-8">{project.tag} · {project.year}</Eyebrow>
          <SplitReveal
            as="h1"
            className="text-[clamp(2.75rem,9vw,96px)] font-bold leading-[0.9] tracking-[-0.05em] text-white"
          >
            {project.name}
          </SplitReveal>
          <p className="mt-6 max-w-[720px] text-[18px] leading-[1.55] text-[var(--t-body)] md:text-[21px]">
            {project.description}
          </p>

          <div className="mt-10">
            <MetaStrip
              items={[
                { label: "Role", value: "Full-stack" },
                { label: "Duration", value: project.duration || "—" },
                { label: "Stack", value: project.stack },
                { label: "Result", value: project.metric, accent: true },
              ]}
            />
          </div>

          {(project.liveUrl || project.repoUrl) && (
            <div className="mt-8 flex flex-wrap gap-3">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={playClick}
                  className="pill mono bg-accent px-[26px] py-[15px] text-[11px] uppercase tracking-[0.14em] text-[#0b0b0b] transition-colors hover:bg-white"
                >
                  Live site ↗
                </a>
              )}
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={playClick}
                  className="pill mono border border-[var(--line-box)] px-[26px] py-[15px] text-[11px] uppercase tracking-[0.14em] text-white transition-colors hover:border-accent hover:text-accent"
                >
                  Source ↗
                </a>
              )}
            </div>
          )}
        </Section>
      </Shell>

      {project.coverUrl && (
        <Shell>
          <div className="relative aspect-[16/9] w-full overflow-hidden border border-[var(--line-box)]">
            <Parallax amount={70} className="absolute -inset-y-[10%] inset-x-0">
              <Image src={project.coverUrl} alt={project.name} fill sizes="1440px" className="object-cover" />
            </Parallax>
          </div>
        </Shell>
      )}

      <Gallery media={project.media} name={project.name} />

      <Shell>
        <Section>
          <Reveal>
          <div className="grid gap-10 md:grid-cols-12 md:gap-6">
            <div className="md:col-span-5">
              <Eyebrow>Problem</Eyebrow>
              <h2 className="text-[28px] font-bold tracking-[-0.04em] text-white md:text-[44px]">
                {problemTitle}
              </h2>
            </div>
            <div className="space-y-4 md:col-span-7">
              {problemBody.map((para, i) => (
                <p key={i} className="text-[15px] text-[var(--t-body)]">
                  {para}
                </p>
              ))}
            </div>
          </div>
          </Reveal>
        </Section>
      </Shell>

      <Shell>
        <Section>
          <Reveal>
          <Eyebrow>Architecture</Eyebrow>
          <Diagram />
          </Reveal>
        </Section>
      </Shell>

      <Shell>
        <Section>
          <Reveal>
          <Eyebrow>Code</Eyebrow>
          <Code
            code={`// mutation → single tag revalidate, no deploy
export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params
  await sql\`update projects set published = not published where id = \${id}\`
  revalidateTag('content')       // /projects re-reads on next request
  return Response.json({ ok: true })
}`}
          />
          </Reveal>
        </Section>
      </Shell>

      <Shell>
        <Section>
          <Reveal>
          <Eyebrow>Results — with caveats</Eyebrow>
          <MetricTile
            metrics={[
              { value: project.metric.split("·")[0]?.trim() || project.metric, label: "Headline", caveat: "Measured on the production build, cold cache." },
              { value: "≤ 60s", label: "Publish → live", caveat: "ISR window; a hard refresh can still hit the old cache once." },
              { value: "190kB", label: "First-load JS", caveat: "3D scene is a separate lazy chunk, excluded here." },
              { value: "95+", label: "Lighthouse", caveat: "Desktop; mobile sits ~5 points lower on throttled 4G." },
            ]}
          />
          </Reveal>
        </Section>
      </Shell>

      {/* Next project */}
      <Shell>
        <Section>
          <Eyebrow>Next</Eyebrow>
          <div className="border-t border-[var(--line)]">
            <ProjectRow project={next} />
          </div>
        </Section>
      </Shell>
    </PageChrome>
  );
}
