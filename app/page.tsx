"use client";

import Image from "next/image";
import { PageChrome, DiagonalBreak } from "@/components/site/Chrome";
import { Shell, Section, Eyebrow, Button, MetaStrip } from "@/components/site/primitives";
import { ProjectRow } from "@/components/site/ProjectRow";
import { Terminal } from "@/components/site/Terminal";
import { SplitReveal, Reveal, Parallax } from "@/components/site/motion";
import { useProjects, useProfile, publicProjects } from "@/lib/store";
import { principles } from "@/lib/data";

export default function HomePage() {
  const profile = useProfile();
  const selected = publicProjects(useProjects()).slice(0, 3);

  return (
    <PageChrome>
      {/* Hero */}
      <div className="relative overflow-hidden">
        <DiagonalBreak side="right" />
        <Shell className="hero-rule pt-16 md:pt-24" >
          <div className="grid gap-10 md:grid-cols-12 md:gap-6">
            <div className="md:col-span-9">
              <Eyebrow>{profile.role} · {profile.location}</Eyebrow>
              <SplitReveal
                as="h1"
                className="text-[46px] font-bold leading-[0.9] tracking-[-0.05em] text-white md:text-[150px] md:leading-[0.86] md:tracking-[-0.055em]"
              >
                Content ships from a browser, not a commit.
              </SplitReveal>
            </div>
            <div className="flex flex-col gap-6 md:col-span-3">
              <div className="relative aspect-[3/4] w-full overflow-hidden border border-[var(--line-box)]">
                {profile.heroUrl && (
                  <Parallax amount={90} className="absolute -inset-y-[8%] inset-x-0">
                    <Image src={profile.heroUrl} alt="Hero" fill sizes="300px" className="object-cover" priority />
                  </Parallax>
                )}
              </div>
              <p className="text-[14px] text-[var(--t-body)] md:text-[15px]">{profile.bio}</p>
              {profile.cvVisible && (
                <Button href="#cv" className="w-full justify-center md:w-auto md:justify-start">
                  Download CV ↓
                </Button>
              )}
            </div>
          </div>
          <Reveal className="mt-14 md:mt-24">
            <MetaStrip
              items={[
                { label: "Role", value: profile.role },
                { label: "Focus", value: "Web · Apps · 3D Design" },
                { label: "Status", value: profile.available ? "Available for work" : "Not available", accent: profile.available },
                { label: "Based in", value: profile.location },
              ]}
            />
          </Reveal>
        </Shell>
      </div>

      {/* Selected work */}
      <Shell>
        <Section>
          <Reveal>
          <div className="mb-8 flex items-end justify-between">
            <div>
              <Eyebrow>Selected work</Eyebrow>
              <h2 className="text-[32px] font-bold tracking-[-0.04em] text-white md:text-[54px]">
                Three that carry the argument.
              </h2>
            </div>
            <Button href="/work" variant="ghost" className="hidden md:inline-flex">
              All work →
            </Button>
          </div>
          <div className="border-t border-[var(--line)]">
            {selected.map((p) => (
              <ProjectRow key={p.id} project={p} />
            ))}
          </div>
          <Button href="/work" variant="ghost" className="mt-8 w-full justify-center md:hidden">
            All work →
          </Button>
          </Reveal>
        </Section>
      </Shell>

      {/* Principles */}
      <Shell>
        <Section>
          <Reveal>
          <Eyebrow>How I work</Eyebrow>
          <div className="grid gap-px bg-[var(--line)] md:grid-cols-2">
            {principles.map((pr) => (
              <div key={pr.n} className="bg-s0 p-6 md:p-8">
                <div className="mono text-[11px] text-accent">{pr.n}</div>
                <h3 className="mt-3 text-[20px] font-bold tracking-[-0.03em] text-white md:text-[24px]">
                  {pr.title}
                </h3>
                <p className="mt-3 text-[14px] text-[var(--t-body)] md:text-[15px]">{pr.body}</p>
              </div>
            ))}
          </div>
          </Reveal>
        </Section>
      </Shell>

      {/* Terminal */}
      <Shell>
        <Section>
          <Reveal>
          <Eyebrow>Publish flow</Eyebrow>
          <div className="grid gap-10 md:grid-cols-12 md:gap-6">
            <div className="md:col-span-5">
              <h2 className="text-[28px] font-bold tracking-[-0.04em] text-white md:text-[44px]">
                Just Type
              </h2>
              <p className="mt-4 text-[15px] text-[var(--t-body)]">
               Use the cli terminal to change routes for commands, the usage is the same as using linux etc.
              </p>
            </div>
            <div className="md:col-span-7">
              <Terminal
                href="/work"
                lines={[
                  { kind: "comment", text: "use this to change routes or links" },
                  // { kind: "cmd", text: "PATCH /api/projects/kanvas-studio/publish" },
                  { kind: "out", text: "→ projects.published = true" },
                  { kind: "cmd", text: "sudo apt update ....." },
                  { kind: "ok", text: "✓ /work revalidated in 41ms — live" },
                ]}
              />
            </div>
          </div>
          </Reveal>
        </Section>
      </Shell>

      <div id="cv" />
    </PageChrome>
  );
}
