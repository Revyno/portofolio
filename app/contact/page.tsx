"use client";

import { useState } from "react";
import { PageChrome, DiagonalBreak } from "@/components/site/Chrome";
import { Shell, Section, Eyebrow, MetaStrip } from "@/components/site/primitives";
import SpecularButtonLink from "@/components/ui/SpecularButtonLink";
import SpecularButton from "@/components/ui/SpecularButton";
import { useProfile, useCvVersions } from "@/lib/store";
import { toast } from "@/lib/toast";
import { Toaster } from "@/components/cms/Toaster";
import { Reveal, LineReveal } from "@/components/site/motion";

export default function ContactPage() {
  const profile = useProfile();
  const liveCv = useCvVersions().find((v) => v.isLive);
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
    <PageChrome>
      <Toaster />
      <div className="relative overflow-hidden">
        <DiagonalBreak side="left" />
        <Shell>
          <Section border={false} className="pt-10 md:pt-20">
            <Eyebrow>Contact</Eyebrow>
            <LineReveal as="h1" className="text-[clamp(2.75rem,13vw,168px)] font-bold leading-[0.84] tracking-[-0.06em] text-white">
              Let’s talk.
            </LineReveal>

            <Reveal className="mt-10">
              <MetaStrip
                items={[
                  { label: "Email", value: profile.email, accent: true },
                  { label: "GitHub", value: `${profile.github}`, accent: true },
                  { label: "LinkedIn", value: profile.linkedin.replace(/^https?:\/\//, ""), href: profile.linkedin.startsWith("http") ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`, accent: true },
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
    </PageChrome>
  );
}
