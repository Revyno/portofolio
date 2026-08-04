"use client";

import Image from "next/image";
import { PageChrome } from "@/components/site/Chrome";
import { Shell, Section, Eyebrow, SkillBar } from "@/components/site/primitives";
import { LineReveal, Reveal } from "@/components/site/motion";
import { useProfile, useCertificates } from "@/lib/store";
import { timeline, skills } from "@/lib/data";
import { TechMarquee } from "@/components/site/TechMarquee";

export default function AboutPage() {
  const profile = useProfile();
  const certificates = useCertificates().filter((c) => c.published);
  return (
    <PageChrome>
      <Shell>
        <Section border={false} className="pt-10 md:pt-20">
          <div className="grid gap-10 md:grid-cols-12 md:gap-6">
            <div className="md:col-span-8">
              <Eyebrow>About</Eyebrow>
              <LineReveal as="h1" className="text-[clamp(2.75rem,8vw,92px)] font-bold leading-[0.9] tracking-[-0.05em] text-white">
                {profile.name}
              </LineReveal>
              <Reveal className="mt-6 max-w-[640px] text-[18px] leading-[1.55] text-[var(--t-body)] md:text-[21px]">
                {profile.bio}
              </Reveal>
            </div>
            <Reveal className="relative aspect-[3/4] w-full border border-[var(--line-box)] md:col-span-4">
              {profile.photoUrl && (
                <Image src={profile.photoUrl} alt={profile.name} fill sizes="360px" className="object-cover" />
              )}
            </Reveal>
          </div>
        </Section>
      </Shell>

      {/* Timeline */}
      {/* <Shell>
        <Section>
          <Eyebrow>Timeline</Eyebrow>
          <div className="border-t border-[var(--line)]">
            {timeline.map((t) => (
              <Reveal key={t.year + t.role}>
                <div className="grid grid-cols-1 gap-2 border-b border-[var(--line)] py-6 md:grid-cols-[160px_1fr_2fr] md:gap-6">
                  <div className="mono text-[13px] text-accent">{t.year}</div>
                  <div className="text-[18px] font-bold tracking-[-0.03em] text-white md:text-[20px]">
                    {t.role}
                    <div className="mono mt-1 text-[10px] uppercase tracking-[0.14em] text-[var(--t-muted)]">
                      {t.org}
                    </div>
                  </div>
                  <p className="text-[14px] text-[var(--t-body)]">{t.note}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>
      </Shell> */}
      

      {/* Contribution + skills */}
      <Shell>
        <Section>
          <div className="grid gap-12 md:grid-cols-12 md:gap-6">
            <Reveal className="md:col-span-5">
              <Eyebrow>Contribution</Eyebrow>
              <div className="scroll-thin overflow-x-auto pb-2">
                <img
                  src="https://raw.githubusercontent.com/Revyno/Revyno/output/snake.svg"
                  alt="Snake animation"
                  className="w-full min-w-[340px]"
                />
              </div>
              <p className="mono mt-4 text-[10px] uppercase tracking-[0.16em] text-[var(--t-muted)]">
               My Github contribution
              </p>
            </Reveal>
            <Reveal className="md:col-span-7">
              <Eyebrow>Skills</Eyebrow>
              {skills.map((s) => (
                <SkillBar key={s.name} {...s} />
              ))}
            </Reveal>
          </div>
        </Section>
      </Shell>

      {/* Stack marquee */}
      {/* add  center eyebrow heading */}

      <div className="flex flex-col items-center">
        <Eyebrow>Tech & Tools</Eyebrow>
        <div className="w-full border-t border-b border-[var(--line)]">
          <TechMarquee />
        </div>
      </div>

      {/* Certificate */}
      <Shell>
        <Section>
          <Eyebrow>Certificate</Eyebrow>
          <div className="border-t border-[var(--line)]">
            {certificates.map((t) => (
              <Reveal key={t.id}>
                <CertificateRow cert={t} />
              </Reveal>
            ))}
          </div>
        </Section>
      </Shell>
    </PageChrome>
  );
}

/** One certificate row. Same grid; adds cover thumb + wraps in a link when linkUrl is set. */
function CertificateRow({ cert }: { cert: import("@/lib/data").Certificate }) {
  const inner = (
    <div className="grid grid-cols-[60px_1fr] items-center gap-4 border-b border-[var(--line)] py-5 md:grid-cols-[120px_64px_1fr_auto]">
      <span className="mono text-[13px] text-[var(--t-muted)]">{cert.year}</span>
      <span className="relative hidden h-[44px] w-[64px] overflow-hidden border border-[var(--line-box)] md:block">
        {cert.coverUrl ? (
          <Image src={cert.coverUrl} alt={cert.title} fill sizes="64px" className="object-cover" />
        ) : null}
      </span>
      <span className="text-[18px] font-bold tracking-[-0.03em] text-white">
        {cert.title}
        {cert.linkUrl && <span className="mono ml-2 text-[11px] text-accent">↗</span>}
      </span>
      <span className="mono text-[10px] uppercase tracking-[0.14em] text-[var(--t-label)]">
        {cert.venue}
      </span>
    </div>
  );
  if (!cert.linkUrl) return inner;
  return (
    <a href={cert.linkUrl} target="_blank" rel="noopener noreferrer" className="block transition-colors hover:bg-[var(--accent-hover)]">
      {inner}
    </a>
  );
}
