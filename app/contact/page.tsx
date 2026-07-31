"use client";

import { useState } from "react";
import { PageChrome, DiagonalBreak } from "@/components/site/Chrome";
import { Shell, Section, Eyebrow, MetaStrip, Button } from "@/components/site/primitives";
import { useProfile } from "@/lib/store";
import { toast } from "@/lib/toast";
import { Toaster } from "@/components/cms/Toaster";
import { Reveal, LineReveal } from "@/components/site/motion";

export default function ContactPage() {
  const profile = useProfile();
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    // ponytail: no backend — just confirm. Wire to /api/contact later.
    setSent(true);
    toast("Message queued — I’ll reply by email");
  }

  const field =
    "w-full border border-[var(--line-box)] bg-field px-3 py-3 text-[13px] text-white placeholder:text-[var(--t-ghost)] outline-none focus:border-accent";

  return (
    <PageChrome>
      <Toaster />
      <div className="relative overflow-hidden">
        <DiagonalBreak side="left" />
        <Shell>
          <Section border={false} className="pt-10 md:pt-20">
            <Eyebrow>Contact</Eyebrow>
            <LineReveal as="h1" className="text-[46px] font-bold leading-[0.84] tracking-[-0.06em] text-white md:text-[168px]">
              Let’s talk.
            </LineReveal>

            <Reveal className="mt-10">
              <MetaStrip
                items={[
                  { label: "Email", value: profile.email, accent: true },
                  { label: "GitHub", value: `@${profile.github}` },
                  { label: "LinkedIn", value: `/${profile.linkedin}` },
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
              <Button type="submit" className="w-full justify-center md:w-auto md:justify-start">
                {sent ? "Sent ✓" : "Send message →"}
              </Button>
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
              {profile.cvVisible && (
                <Button href="#" variant="ghost" className="mt-8">
                  Download CV ↓
                </Button>
              )}
            </div>
          </div>
          </Reveal>
        </Section>
      </Shell>
    </PageChrome>
  );
}
