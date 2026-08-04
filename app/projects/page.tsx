"use client";

import { useMemo, useState } from "react";
import { PageChrome } from "@/components/site/Chrome";
import { Shell, Section, Eyebrow } from "@/components/site/primitives";
import { ProjectCard } from "@/components/site/ProjectRow";
import { LineReveal, Reveal } from "@/components/site/motion";
import { useProjects, publicProjects } from "@/lib/store";
import { playClick } from "@/lib/sound";

export default function ProjectsPage() {
  const all = publicProjects(useProjects());
  const [tag, setTag] = useState<string>("All");

  // filter chips built automatically from tags (with counts) — DESIGN §9
  const chips = useMemo(() => {
    const counts = new Map<string, number>();
    all.forEach((p) => counts.set(p.tag, (counts.get(p.tag) ?? 0) + 1));
    return [
      { label: "All", count: all.length },
      ...[...counts.entries()].map(([label, count]) => ({ label, count })),
    ];
  }, [all]);

  const shown = tag === "All" ? all : all.filter((p) => p.tag === tag);

  return (
    <PageChrome>
      <Shell>
        <Section border={false} className="pt-10 md:pt-20">
          <Eyebrow>{all.length} published projects</Eyebrow>
          <LineReveal as="h1" className="text-[clamp(3rem,8vw,92px)] font-bold leading-[0.9] tracking-[-0.05em] text-white">
            Projects
          </LineReveal>

          {/* filter chips */}
          <Reveal className="mt-10 flex flex-wrap gap-2">
            {chips.map((c) => {
              const active = c.label === tag;
              return (
                <button
                  key={c.label}
                  onClick={() => { playClick(); setTag(c.label); }}
                  className={`pill mono border px-4 py-[14px] text-[9.5px] uppercase tracking-[0.14em] transition-colors md:py-2 ${
                    active
                      ? "border-accent bg-accent text-[#0b0b0b]"
                      : "border-[var(--line-box)] text-[var(--t-muted)] hover:text-white"
                  }`}
                >
                  {c.label} <span className={active ? "opacity-70" : "opacity-50"}>{c.count}</span>
                </button>
              );
            })}
          </Reveal>

          {/* grid — border top+right so cards' left/bottom borders complete the cells */}
          <Reveal className="mt-10 grid grid-cols-2 border-r border-t border-[var(--line)] sm:grid-cols-3 md:grid-cols-4">
            {shown.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </Reveal>
          {shown.length === 0 && (
            <p className="mono mt-10 text-[12px] uppercase tracking-[0.14em] text-[var(--t-muted)]">
              No projects with tag “{tag}”.
            </p>
          )}
        </Section>
      </Shell>
    </PageChrome>
  );
}
