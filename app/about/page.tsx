"use client";

import Image from "next/image";
import { PageChrome } from "@/components/site/Chrome";
import { Shell, Section, Eyebrow, SkillBar, Heatmap } from "@/components/site/primitives";
import { useProfile } from "@/lib/store";
import { timeline, skills, talks, heatmap } from "@/lib/data";

export default function AboutPage() {
  const profile = useProfile();
  return (
    <PageChrome>
      <Shell>
        <Section border={false} className="pt-12 md:pt-20">
          <div className="grid gap-10 md:grid-cols-12 md:gap-6">
            <div className="md:col-span-8">
              <Eyebrow>About</Eyebrow>
              <h1 className="text-[46px] font-bold leading-[0.9] tracking-[-0.05em] text-white md:text-[92px]">
                {profile.name}
              </h1>
              <p className="mt-6 max-w-[640px] text-[18px] leading-[1.55] text-[var(--t-body)] md:text-[21px]">
                {profile.bio}
              </p>
            </div>
            <div className="relative aspect-[3/4] w-full border border-[var(--line-box)] md:col-span-4">
              {profile.photoUrl && (
                <Image src={profile.photoUrl} alt={profile.name} fill sizes="360px" className="object-cover" />
              )}
            </div>
          </div>
        </Section>
      </Shell>

      {/* Timeline */}
      <Shell>
        <Section>
          <Eyebrow>Timeline</Eyebrow>
          <div className="border-t border-[var(--line)]">
            {timeline.map((t) => (
              <div
                key={t.year + t.role}
                className="grid grid-cols-1 gap-2 border-b border-[var(--line)] py-6 md:grid-cols-[160px_1fr_2fr] md:gap-6"
              >
                <div className="mono text-[13px] text-accent">{t.year}</div>
                <div className="text-[18px] font-bold tracking-[-0.03em] text-white md:text-[20px]">
                  {t.role}
                  <div className="mono mt-1 text-[10px] uppercase tracking-[0.14em] text-[var(--t-muted)]">
                    {t.org}
                  </div>
                </div>
                <p className="text-[14px] text-[var(--t-body)]">{t.note}</p>
              </div>
            ))}
          </div>
        </Section>
      </Shell>

      {/* Contribution + skills */}
      <Shell>
        <Section>
          <div className="grid gap-12 md:grid-cols-12 md:gap-6">
            <div className="md:col-span-5">
              <Eyebrow>Contribution</Eyebrow>
              <div className="scroll-thin overflow-x-auto pb-2">
                <Heatmap grid={heatmap} />
              </div>
              <p className="mono mt-4 text-[10px] uppercase tracking-[0.16em] text-[var(--t-muted)]">
                Last 20 weeks · 4 levels
              </p>
            </div>
            <div className="md:col-span-7">
              <Eyebrow>Skills</Eyebrow>
              {skills.map((s) => (
                <SkillBar key={s.name} {...s} />
              ))}
            </div>
          </div>
        </Section>
      </Shell>

      {/* Talks */}
      <Shell>
        <Section>
          <Eyebrow>Talks</Eyebrow>
          <div className="border-t border-[var(--line)]">
            {talks.map((t) => (
              <div
                key={t.title}
                className="grid grid-cols-[60px_1fr] items-baseline gap-4 border-b border-[var(--line)] py-5 md:grid-cols-[120px_1fr_auto]"
              >
                <span className="mono text-[13px] text-[var(--t-muted)]">{t.year}</span>
                <span className="text-[18px] font-bold tracking-[-0.03em] text-white">{t.title}</span>
                <span className="mono text-[10px] uppercase tracking-[0.14em] text-[var(--t-label)]">
                  {t.venue}
                </span>
              </div>
            ))}
          </div>
        </Section>
      </Shell>
    </PageChrome>
  );
}
