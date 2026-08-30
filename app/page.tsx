"use client";

import Image from "next/image";
import { useState } from "react";
import { PageChrome } from "@/components/site/Chrome";
import { Shell, Section, Eyebrow, MetaStrip, SkillBar } from "@/components/site/primitives";
import SpecularButtonLink from "@/components/ui/SpecularButtonLink";
import SpecularButton from "@/components/ui/SpecularButton";
import { Terminal } from "@/components/site/Terminal";
import { TechMarquee } from "@/components/site/TechMarquee";
import { ProjectsView } from "./projects/ProjectsView";
import { SplitReveal, Reveal, LineReveal } from "@/components/site/motion";
import { ArtPlate } from "@/components/site/ArtPlate";
import { PageVeil } from "@/components/site/PageVeil";
import { PLATES } from "@/components/site/plates";
import { Toaster } from "@/components/cms/Toaster";
import { toast } from "@/lib/toast";
import {
  useProjects,
  useProfile,
  useCvVersions,
  useJourney,
  useCertificates,
  publicProjects,
} from "@/lib/store";
import type { Certificate, Profile, CvVersion } from "@/lib/data";
import { principles, skills } from "@/lib/data";

/**
 * Single-page landing. Every former route is now an anchored section:
 * #home #work #about #journey #contact. Nav + mobile tab bar scroll-spy
 * these ids. Data is client-side (store) so the whole page is frontend-only.
 */
export default function LandingPage() {
  const profile = useProfile();
  const projects = publicProjects(useProjects());
  const liveCv = useCvVersions().find((v) => v.isLive);

  return (
    <PageChrome closing={<ContactSection profile={profile} liveCv={liveCv} />}>
      <PageVeil />
      <Toaster />
      <HeroSection profile={profile} liveCv={liveCv} />
      {/* Everything after the hero rides up over it. The hero is sticky, so
          these need an opaque background and a higher stacking order or the
          pinned plate shows straight through them. One wrapper rather than a
          background on each section. */}
      <div className="relative z-10 bg-s0">
        <section id="work" className="scroll-mt-[84px]">
          <ProjectsView projects={projects} />
        </section>
        <AboutSection profile={profile} />
        <JourneySection />
      </div>
    </PageChrome>
  );
}

/* ---------------------------------------------------------------- Hero -- */
function HeroSection({ profile, liveCv }: { profile: Profile; liveCv?: CvVersion }) {
  return (
    <section
      id="home"
      // Sticky, exactly one viewport tall: it holds while the sections after it
      // climb over the top. A sticky element taller than the viewport can never
      // be scrolled to its own bottom, so the fixed height is load-bearing, not
      // cosmetic — the content has to fit one screen.
      //
      // -mt-[70px] pulls it under the sticky nav, which still occupies its 70px
      // in the flow. Without it the plate starts below the nav and leaves a bare
      // band across the top. Both desktop-only: there is no top nav under md,
      // and the hero content does not fit a phone screen.
      className="relative flex min-h-[88svh] scroll-mt-[84px] flex-col overflow-hidden md:sticky md:top-0 md:-mt-[70px] md:h-[100svh] md:min-h-0"
    >
      {/* Baroque plate replaces the DiagonalBreak — the cyan hatch box fought
          the painting. Same call on Contact, which now sits on a plate too. */}
      <ArtPlate
        src={PLATES.hero.src}
        focal={PLATES.hero.focal}
        focalMobile={PLATES.hero.focalMobile}
        scrim={0.94}
        scrimEnd={0.99}
        columns
        priority
        mode="scrub"
      />

      {/* Edge labels — the reference runs small caps up both margins of the
          plate. Desktop only: at phone width the gutters are 22px. */}
      <span className="v-label v-label-left mono absolute left-[24px] top-1/2 z-10 hidden -translate-y-1/2 text-[10px] uppercase text-[var(--t-label)] md:block">
        Portfolio — {new Date().getFullYear()}
      </span>
      <span className="v-label mono absolute right-[24px] top-1/2 z-10 hidden -translate-y-1/2 text-[10px] uppercase text-[var(--t-label)] md:block">
        Scroll to selected work ↓
      </span>

      {/* Extra top padding on desktop keeps the centred block optically below
          the nav now that the section starts behind it. */}
      <Shell className="relative z-10 flex flex-1 flex-col items-center justify-center py-14 text-center md:pt-[90px] md:pb-20">
        {/* No accent inside the plate: the one cyan on a painting read as a
            stray. Type carries the hierarchy here instead of colour. */}
        <Eyebrow className="eyebrow-plain">
          {profile.role} · {profile.location}
        </Eyebrow>
        <SplitReveal
          as="h1"
          hold
          className="max-w-[16ch] text-[clamp(2.5rem,8vw,116px)] font-bold leading-[0.92] tracking-[-0.045em] text-white md:leading-[0.88] md:tracking-[-0.05em]"
        >
          Revellio Christopel Oktufovian Lumbaa
        </SplitReveal>
        <Reveal hold delay={0.05} className="mt-9 flex flex-col items-center gap-6 md:mt-11">
          <span aria-hidden className="block h-px w-[56px] bg-[rgba(255,255,255,0.55)]" />
          {/* Clamped: the reference caps this slot at a couple of lines, and a
              full bio here pushes the CV button and meta strip off the fold.
              About still renders the bio in full. */}
          <p className="line-clamp-3 max-w-[560px] text-[14px] leading-[1.6] text-[var(--t-body)] md:text-[15px]">
            {profile.bio}
          </p>
          {profile.cvVisible && liveCv?.url && (
            <SpecularButtonLink href={liveCv.url}>Download CV ↓</SpecularButtonLink>
          )}
          {/* Scroll hint. Drawn as SVG on purpose: the mouse outline needs
              round corners, and the global `* { border-radius: 0 !important }`
              reset would flatten a CSS-drawn one. `rx` is a different property,
              so the reset never touches it. Decorative — a screen reader has no
              use for "scroll down". */}
          <span aria-hidden className="scroll-hint mt-2">
            <svg width="24" height="38" viewBox="0 0 24 38" fill="none">
              <rect
                x="0.75"
                y="0.75"
                width="22.5"
                height="36.5"
                rx="11.25"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle className="scroll-hint-dot" cx="12" cy="10" r="2" fill="currentColor" />
            </svg>
            <span className="mono text-[9px] uppercase tracking-[0.22em]">Scroll Down</span>
          </span>
        </Reveal>
      </Shell>

      <Shell className="relative z-10 pb-10 md:pb-14">
        <Reveal hold delay={0.12}>
          <MetaStrip
            items={[
              { label: "Role", value: profile.role },
              { label: "Focus", value: "Web · Apps · 3D Design" },
              { label: "Status", value: profile.available ? "Available for work" : "Not available" },
              { label: "Based in", value: profile.location },
            ]}
          />
        </Reveal>
      </Shell>
    </section>
  );
}

/* --------------------------------------------------------------- About -- */
function AboutSection({ profile }: { profile: Profile }) {
  const certificates = useCertificates().filter((c) => c.published);
  return (
    <section id="about" className="scroll-mt-[84px]">
      <Shell>
        <Section className="pt-10 md:pt-20">
          <div className="grid gap-10 md:grid-cols-12 md:gap-6">
            <div className="md:col-span-8">
              <Eyebrow>About</Eyebrow>
              <LineReveal as="h2" className="text-[clamp(2.75rem,8vw,92px)] font-bold leading-[0.9] tracking-[-0.05em] text-white">
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

      {/* How I work */}
      <Shell>
        <Section>
          <Reveal>
            <Eyebrow>How I work</Eyebrow>
            <div className="grid gap-px bg-[var(--line)] md:grid-cols-2">
              {principles.map((pr) => (
                <div key={pr.n} className="bg-s0 p-6 md:p-8">
                  <div className="mono text-[11px] text-accent">{pr.n}</div>
                  <h3 className="mt-3 text-[20px] font-bold tracking-[-0.03em] text-white md:text-[24px]">{pr.title}</h3>
                  <p className="mt-3 text-[14px] text-[var(--t-body)] md:text-[15px]">{pr.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </Section>
      </Shell>

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
              <p className="mono mt-4 text-[10px] uppercase tracking-[0.16em] text-[var(--t-muted)]">My Github contribution</p>
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

      {/* Publish flow terminal */}
      <Shell>
        <Section>
          <Reveal>
            <Eyebrow>Publish flow</Eyebrow>
            <div className="grid gap-10 md:grid-cols-12 md:gap-6">
              <div className="md:col-span-5">
                <LineReveal as="h2" className="text-[28px] font-bold tracking-[-0.04em] text-white md:text-[44px]">
                  Just Type
                </LineReveal>
                <p className="mt-4 text-[15px] text-[var(--t-body)]">
                  Use the cli terminal to jump between sections, the usage is the same as using linux etc.
                </p>
              </div>
              <div className="md:col-span-7">
                <Terminal
                  href="/projects"
                  lines={[
                    { kind: "comment", text: "use this to jump to a section" },
                    { kind: "out", text: "→ projects.published = true" },
                    { kind: "cmd", text: "sudo apt update ....." },
                    { kind: "ok", text: "✓ #work revalidated in 41ms — live" },
                  ]}
                />
              </div>
            </div>
          </Reveal>
        </Section>
      </Shell>
    </section>
  );
}

/** One certificate row. Same grid; adds cover thumb + wraps in a link when linkUrl is set. */
function CertificateRow({ cert }: { cert: Certificate }) {
  const inner = (
    <div className="grid grid-cols-[60px_1fr] items-center gap-4 border-b border-[var(--line)] py-5 md:grid-cols-[120px_64px_1fr_auto]">
      <span className="mono text-[13px] text-[var(--t-muted)]">{cert.year}</span>
      <span className="relative hidden h-[44px] w-[64px] overflow-hidden border border-[var(--line-box)] md:block">
        {cert.coverUrl ? <Image src={cert.coverUrl} alt={cert.title} fill sizes="64px" className="object-cover" /> : null}
      </span>
      <span className="text-[18px] font-bold tracking-[-0.03em] text-white">
        {cert.title}
        {cert.linkUrl && <span className="mono ml-2 text-[11px] text-accent">↗</span>}
      </span>
      <span className="mono text-[10px] uppercase tracking-[0.14em] text-[var(--t-label)]">{cert.venue}</span>
    </div>
  );
  if (!cert.linkUrl) return inner;
  return (
    <a href={cert.linkUrl} target="_blank" rel="noopener noreferrer" className="block transition-colors hover:bg-[var(--accent-hover)]">
      {inner}
    </a>
  );
}

/* ------------------------------------------------------------- Journey -- */
function jfmt(iso: string): string {
  if (!iso) return "—";
  const [y, m] = iso.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[Number(m) - 1] ?? ""} ${y}`;
}

function JourneySection() {
  const steps = useJourney()
    .filter((j) => j.published)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const presentIdx = steps.findIndex((s) => s.ongoing);
  const activeIdx = presentIdx === -1 ? 0 : presentIdx;

  return (
    <section id="journey" className="scroll-mt-[84px]">
      <Shell>
        <Section className="pt-10 md:pt-20">
          <Eyebrow>{steps.length} milestones</Eyebrow>
          <LineReveal as="h2" className="text-[clamp(3rem,8vw,92px)] font-bold leading-[0.9] tracking-[-0.05em] text-white">
            Journey
          </LineReveal>
        </Section>
      </Shell>

      <Shell>
        <Section border={false} className="pt-0">
          {steps.length === 0 ? (
            <p className="mono text-[12px] uppercase tracking-[0.14em] text-[var(--t-muted)]">No milestones published yet.</p>
          ) : (
            <ol className="relative">
              <span aria-hidden className="absolute left-[7px] top-2 bottom-2 w-px bg-[var(--line)] md:left-[11px]" />
              {steps.map((s, i) => (
                <Reveal key={s.id}>
                  <li className="relative grid grid-cols-[28px_1fr] gap-4 pb-8 last:pb-0 md:grid-cols-[40px_1fr] md:gap-8 md:pb-12">
                    <div className="relative flex justify-center pt-1">
                      <span
                        className={`mt-[6px] h-[10px] w-[10px] border md:h-[14px] md:w-[14px] ${
                          i === activeIdx
                            ? "border-accent bg-accent shadow-[0_0_0_4px_rgba(76,224,255,0.18)]"
                            : "border-[var(--line-diagram)] bg-s0"
                        }`}
                      />
                    </div>
                    <div className="border-b border-[var(--line)] pb-8 md:pb-12">
                      <div className="mono text-[11px] uppercase tracking-[0.14em] text-accent">
                        {jfmt(s.date)} — {s.ongoing ? "Present" : s.endDate ? jfmt(s.endDate) : ""}
                      </div>
                      <h2 className="mt-2 text-[18px] font-bold leading-[1.1] tracking-[-0.03em] text-white md:text-[30px]">{s.title}</h2>
                      {s.org && (
                        <div className="mono mt-1 text-[10px] uppercase tracking-[0.14em] text-[var(--t-muted)]">{s.org}</div>
                      )}
                      {s.note && (
                        <p className="mt-4 max-w-[640px] text-[14px] leading-[1.65] text-[var(--t-body)] md:text-[15px]">{s.note}</p>
                      )}
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          )}
        </Section>
      </Shell>
    </section>
  );
}

/* ------------------------------------------------------------- Contact -- */
function ContactSection({ profile, liveCv }: { profile: Profile; liveCv?: CvVersion }) {
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // ponytail: no backend — just confirm. Wire to /api/contact later.
    setSent(true);
    toast("Message queued — I’ll reply by email");
  }

  const field =
    "w-full border border-[var(--line-box)] bg-field px-3 py-3 text-[16px] text-white placeholder:text-[var(--t-ghost)] outline-none focus:border-accent md:text-[13px]";

  return (
    <section id="contact" className="scroll-mt-[84px]">
      <div className="relative overflow-hidden">
        <Shell>
          <Section className="pt-10 md:pt-20">
            <Eyebrow>Contact</Eyebrow>
            <LineReveal as="h2" className="text-[clamp(2.75rem,13vw,168px)] font-bold leading-[0.84] tracking-[-0.06em] text-white">
              Let’s talk.
            </LineReveal>

            <Reveal className="mt-10">
              <MetaStrip
                items={[
                  { label: "Email", value: profile.email, accent: true },
                  { label: "GitHub", value: `${profile.github}`, accent: true },
                  {
                    label: "LinkedIn",
                    value: profile.linkedin.replace(/^https?:\/\//, ""),
                    href: profile.linkedin.startsWith("http") ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`,
                    accent: true,
                  },
                  { label: "Location", value: profile.location },
                ]}
              />
            </Reveal>
          </Section>
        </Shell>
      </div>

      <Shell>
        <Section>
          <Reveal>
            <div className="grid gap-12 md:grid-cols-12 md:gap-6">
              <form onSubmit={submit} className="space-y-4 md:col-span-7">
                <div>
                  <label className="meta-label mb-2 block">Name</label>
                  <input required className={field} placeholder="Your name" />
                </div>
                <div>
                  <label className="meta-label mb-2 block">Email</label>
                  <input required type="email" className={field} placeholder="you@company.com" />
                </div>
                <div>
                  <label className="meta-label mb-2 block">Message</label>
                  <textarea required rows={5} className={field} placeholder="What are you building?" />
                </div>
                <SpecularButton
                  type="submit"
                  size="md"
                  radius={0}
                  autoAnimate={sent}
                  lineColor="#4ce0ff"
                  baseColor="#0b0b0b"
                  textColor={sent ? "#4ce0ff" : "#ffffff"}
                  className="mono uppercase tracking-[0.14em] !text-[12px]"
                >
                  {sent ? "Sent ✓" : "Send message"}
                </SpecularButton>
              </form>

              <div className="md:col-span-5">
                <Eyebrow>What I’m looking for</Eyebrow>
                <ul className="space-y-4">
                  {[
                    "Product-grade web apps where content velocity matters.",
                    "Teams that value measured results over demo polish.",
                    "3D / motion work that stays inside a performance budget.",
                    "Freelance builds with a clear metric to move.",
                  ].map((t) => (
                    <li key={t} className="flex gap-3 border-b border-[var(--line)] pb-4 text-[15px] text-[var(--t-body)]">
                      <span className="mono text-accent">→</span>
                      {t}
                    </li>
                  ))}
                </ul>
                {profile.cvVisible && liveCv?.url && (
                  <SpecularButtonLink href={liveCv.url} className="mt-8">
                    Download CV ↓
                  </SpecularButtonLink>
                )}
              </div>
            </div>
          </Reveal>
        </Section>
      </Shell>
    </section>
  );
}
