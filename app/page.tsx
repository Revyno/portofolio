"use client";

import Image from "next/image";
import { useState } from "react";
import { PageChrome } from "@/components/site/Chrome";
import { Shell, Section, Eyebrow, MetaStrip, SkillBar } from "@/components/site/primitives";
import { PixelButton } from "@/components/ui/PixelButton";
import { Terminal } from "@/components/site/Terminal";
import { TechMarquee } from "@/components/site/TechMarquee";
import { CertificateTicker } from "@/components/site/CertificateTicker";
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
import type { Profile, CvVersion } from "@/lib/data";
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
    <PageChrome closing={<ContactPanel profile={profile} />}>
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
        <ContactFormSection />
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
            {/* Hero shows the first full sentence only — the raw clamp cut the
                bio mid-word ("…Next.j"). About still renders the bio in full. */}
            {profile.bio.split(/(?<=[.!?])\s+/)[0]}
          </p>
          {profile.cvVisible && liveCv?.url && (
            <PixelButton href={liveCv.url} size="sm" variant="dark" className="pill">Download CV ↓</PixelButton>
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
          <Reveal>
            <Eyebrow>Certificate</Eyebrow>
            <div className="grid gap-10 md:grid-cols-12 md:gap-6">
              <div className="md:col-span-5">
                <LineReveal as="h2" className="text-[28px] font-bold tracking-[-0.04em] text-white md:text-[44px]">
                  Certified &amp; verified
                </LineReveal>
                <p className="mt-4 text-[15px] text-[var(--t-body)]">
                  A live ticker of credentials — it scrolls on its own. Hover to pause, and open any card marked ↗ to view the original.
                </p>
              </div>
              <div className="md:col-span-7">
                <CertificateTicker items={certificates} />
              </div>
            </div>
          </Reveal>
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
/** WhatsApp is where Indonesian project conversations actually happen. Same
 *  number as the footer link. ponytail: lift both into the CMS profile. */
const WHATSAPP = "6281248608150";

const PROJECT_TYPES = [
  "Landing page / company profile",
  "Web app / dashboard",
  "E-commerce",
  "CMS / content platform",
  "API / system integration",
  "Something else",
];

/** Bands, not a single number: a range qualifies the lead without either side
 *  anchoring first. ponytail: confirm these match the real floor before launch. */
const BUDGETS = [
  "Under Rp 5 jt",
  "Rp 5 - 15 jt",
  "Rp 15 - 40 jt",
  "Rp 40 - 100 jt",
  "Above Rp 100 jt",
  "Not sure yet - advise me",
];

const TIMELINES = ["ASAP", "Within 1-3 months", "Later this year", "Still exploring"];

/** The questions that decide whether a stranger sends the first message.
 *  ponytail: every answer below is a commercial commitment - confirm each. */
const FAQS: { q: string; a: string }[] = [
  {
    q: "How much does a project cost?",
    a: "It depends on scope, so the honest answer comes after a short call. As a reference: a company profile or landing page usually lands in the Rp 5-15 jt band, a CMS-backed site with an admin panel in Rp 15-40 jt, and anything with custom integrations or a longer engagement above that. You get a fixed quote before any work starts - no hourly surprises.",
  },
  {
    q: "How long does it take?",
    a: "A landing page is typically 1-2 weeks. A CMS-backed site is 3-5 weeks. A custom web app depends on the feature list, but it is broken into milestones so you see something working every week rather than waiting for one big reveal.",
  },
  {
    q: "How do we start?",
    a: "Send the brief through the form or WhatsApp. We do a 30-minute call to pin down scope, then you get a written proposal with the price, the milestones, and what is explicitly out of scope. Nothing is charged until you approve that document.",
  },
  {
    q: "How does payment work?",
    a: "50% down payment to start and 50% on handover for shorter projects. Longer engagements are split per milestone so your exposure stays small. Invoiced in IDR, transfer to a local bank account.",
  },
  {
    q: "How many revisions do I get?",
    a: "Two rounds per milestone are included, which covers the normal back-and-forth. Beyond that, or if the scope itself changes, we agree the extra cost in writing first - so it never turns into an awkward conversation later.",
  },
  {
    q: "Do I own the code?",
    a: "Yes. On final payment the repository, the domain, the hosting and every account move to your name. No lock-in, and nothing keeps running on my accounts unless you ask me to maintain it.",
  },
  {
    q: "What happens after launch?",
    a: "Thirty days of bug fixes are included at no cost. Monthly maintenance after that is optional - handing you something you can run yourself beats selling you a dependency.",
  },
  {
    q: "Can you work with my existing team?",
    a: "Yes. I take contract work alongside in-house teams and agencies, either owning a specific scope or adding a pair of hands to an existing codebase. Code review and handover documentation come with it.",
  },
];

/**
 * Freelance enquiry. Split out of the closing panel on purpose: the panel is
 * pinned, and a pinned block taller than the viewport can never be scrolled to
 * its own bottom. The full Contact section measured 1201px against a 900px
 * viewport - moving this here is what buys the panel its headroom.
 *
 * Submitting opens WhatsApp with the brief pre-filled rather than posting
 * anywhere. There is no backend, and a lead form that quietly drops what a
 * stranger just typed is worse than no form at all.
 */
function ContactFormSection() {
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "").trim();
    const brief = [
      "Halo Revellio, saya mau diskusi proyek.",
      "",
      `Nama: ${get("name")}`,
      `Email: ${get("email")}`,
      `Perusahaan: ${get("company") || "-"}`,
      `Jenis proyek: ${get("type")}`,
      `Budget: ${get("budget")}`,
      `Timeline: ${get("timeline")}`,
      "",
      "Kebutuhan:",
      get("message"),
    ].join("\n");
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(brief)}`, "_blank", "noopener");
    setSent(true);
    toast("Opening WhatsApp with your brief");
  }

  const field =
    "w-full border border-[var(--line-box)] bg-field px-3 py-3 text-[16px] text-white placeholder:text-[var(--t-ghost)] outline-none focus:border-accent md:text-[13px]";

  return (
    <Shell>
      <Section>
        <Reveal>
          <Eyebrow>Freelance</Eyebrow>
          <LineReveal as="h2" className="text-[clamp(2rem,5vw,56px)] font-bold leading-[0.95] tracking-[-0.04em] text-white">
            Start a project.
          </LineReveal>
          <p className="mt-5 max-w-[560px] text-[15px] leading-[1.6] text-[var(--t-body)]">
            Tell me the scope and the budget band. You get a fixed quote and a milestone plan
            before anything is charged.
          </p>

          {/* Constrained width rather than a 12-column grid: with the right
              column gone, a form stretched over the full Shell reads as a hole
              beside itself and the input lines get uncomfortably long. */}
          <div className="mt-12 max-w-[680px]">
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="meta-label mb-2 block">Name</label>
                  <input name="name" required className={field} placeholder="Your name" />
                </div>
                <div>
                  <label className="meta-label mb-2 block">Email</label>
                  <input name="email" required type="email" className={field} placeholder="you@company.com" />
                </div>
              </div>
              <div>
                <label className="meta-label mb-2 block">Company (optional)</label>
                <input name="company" className={field} placeholder="Company or brand" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="meta-label mb-2 block">Project type</label>
                  <select name="type" required defaultValue={PROJECT_TYPES[0]} className={field}>
                    {PROJECT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="meta-label mb-2 block">Budget</label>
                  <select name="budget" required defaultValue={BUDGETS[1]} className={field}>
                    {BUDGETS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="meta-label mb-2 block">Timeline</label>
                <select name="timeline" required defaultValue={TIMELINES[1]} className={field}>
                  {TIMELINES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="meta-label mb-2 block">What are you building?</label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  className={field}
                  placeholder="The problem, who it is for, and anything already built."
                />
              </div>
              <PixelButton
                type="submit"
                size="sm"
                variant="dark"
                active={sent}
                // !text-[11px] is not cosmetic: globals.css has an unlayered
                // `button { font: inherit }`, which beats Tailwind's layered
                // text-* utility. Without the important modifier this renders at
                // the 15px body size while the <a> buttons sit at 11px.
                className="pill mono uppercase tracking-[0.14em] !text-[11px]"
              >
                {sent ? "Sent ✓" : "Send brief via WhatsApp"}
              </PixelButton>
              <p className="mono text-[10px] uppercase tracking-[0.16em] text-[var(--t-label)]">
                Opens WhatsApp with your answers filled in
              </p>
            </form>
          </div>

          {/* Native <details>: an accordion with no library, no state and no
              JavaScript - it still opens if the bundle never loads. */}
          <div className="mt-20">
            <Eyebrow>Frequently asked</Eyebrow>
            <div className="border-t border-[var(--line)]">
              {FAQS.map((item) => (
                <details key={item.q} className="faq border-b border-[var(--line)]">
                  <summary className="flex cursor-pointer items-center justify-between gap-8 py-5 text-[16px] font-medium text-white md:text-[18px]">
                    {item.q}
                    <span className="faq-mark mono shrink-0 text-[18px] text-accent">+</span>
                  </summary>
                  <p className="max-w-[76ch] pb-6 text-[14px] leading-[1.7] text-[var(--t-body)] md:text-[15px]">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </Reveal>
      </Section>
    </Shell>
  );
}


/**
 * The closing panel: headline + contact meta, sharing one plate with the footer.
 * Kept under one viewport so PageChrome can pin it and let the page slide off.
 */
function ContactPanel({ profile }: { profile: Profile }) {
  return (
    <section id="contact" className="scroll-mt-[84px]">
      <Shell>
        <Section className="pt-10 md:pt-16" border={false}>
          <Eyebrow>Contact</Eyebrow>
          <LineReveal as="h2" className="text-[clamp(2.75rem,11vw,140px)] font-bold leading-[0.84] tracking-[-0.06em] text-white">
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
    </section>
  );
}
