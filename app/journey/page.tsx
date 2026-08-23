"use client";

import { PageChrome } from "@/components/site/Chrome";
import { Shell, Section, Eyebrow } from "@/components/site/primitives";
import { LineReveal, Reveal } from "@/components/site/motion";
import { useJourney } from "@/lib/store";

function fmt(iso: string): string {
  if (!iso) return "—";
  const [y, m] = iso.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[Number(m) - 1] ?? ""} ${y}`;
}

export default function JourneyPage() {
  const steps = useJourney()
    .filter((j) => j.published)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  // Highlight the "Present" (ongoing) milestone, not just the newest by date.
  const presentIdx = steps.findIndex((s) => s.ongoing);
  const activeIdx = presentIdx === -1 ? 0 : presentIdx;

  return (
    <PageChrome>
      <Shell>
        <Section border={false} className="pt-10 md:pt-20">
          <Eyebrow>{steps.length} milestones</Eyebrow>
          <LineReveal as="h1" className="text-[clamp(3rem,8vw,92px)] font-bold leading-[0.9] tracking-[-0.05em] text-white">
            Journey
          </LineReveal>
        </Section>
      </Shell>

      <Shell>
        <Section border={false} className="pt-0">
          {steps.length === 0 ? (
            <p className="mono text-[12px] uppercase tracking-[0.14em] text-[var(--t-muted)]">
              No milestones published yet.
            </p>
          ) : (
            <ol className="relative">
              {/* vertical rail */}
              <span
                aria-hidden
                className="absolute left-[7px] top-2 bottom-2 w-px bg-[var(--line)] md:left-[11px]"
              />
              {steps.map((s, i) => (
                <Reveal key={s.id}>
                  <li className="relative grid grid-cols-[28px_1fr] gap-4 pb-8 last:pb-0 md:grid-cols-[40px_1fr] md:gap-8 md:pb-12">
                    {/* node */}
                    <div className="relative flex justify-center pt-1">
                      <span
                        className={`mt-[6px] h-[10px] w-[10px] border md:h-[14px] md:w-[14px] ${
                          i === activeIdx
                            ? "border-accent bg-accent shadow-[0_0_0_4px_rgba(76,224,255,0.18)]"
                            : "border-[var(--line-diagram)] bg-s0"
                        }`}
                      />
                    </div>
                    {/* content */}
                    <div className="border-b border-[var(--line)] pb-8 md:pb-12">
                      <div className="mono text-[11px] uppercase tracking-[0.14em] text-accent">
                        {fmt(s.date)} — {s.ongoing ? "Present" : s.endDate ? fmt(s.endDate) : ""}
                      </div>
                      <h2 className="mt-2 text-[18px] font-bold leading-[1.1] tracking-[-0.03em] text-white md:text-[30px]">
                        {s.title}
                      </h2>
                      {s.org && (
                        <div className="mono mt-1 text-[10px] uppercase tracking-[0.14em] text-[var(--t-muted)]">
                          {s.org}
                        </div>
                      )}
                      {s.note && (
                        <p className="mt-4 max-w-[640px] text-[14px] leading-[1.65] text-[var(--t-body)] md:text-[15px]">
                          {s.note}
                        </p>
                      )}
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          )}
        </Section>
      </Shell>
    </PageChrome>
  );
}
