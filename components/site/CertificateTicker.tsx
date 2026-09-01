"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { motion, useMotionValue, useAnimationFrame, useReducedMotion } from "motion/react";
import type { Certificate } from "@/lib/data";

/**
 * Vertical infinite ticker for certificates — inspired by Motion's ticker-y-axis
 * example (https://examples.motion.dev/react/ticker-y-axis). The list scrolls up
 * forever by translating a doubled stack and wrapping by one group's height, so
 * the loop is seamless. Pauses on hover; honors prefers-reduced-motion.
 */
const SPEED = 32; // px per second

const MASK = "linear-gradient(to bottom, transparent, #000 12%, #000 88%, transparent)";

export function CertificateTicker({ items }: { items: Certificate[] }) {
  const y = useMotionValue(0);
  const groupRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();

  useAnimationFrame((_, delta) => {
    if (paused || reduced || !groupRef.current) return;
    const h = groupRef.current.offsetHeight;
    if (!h) return;
    let next = y.get() - (SPEED * delta) / 1000;
    if (-next >= h) next += h; // wrapped a full group — reset seamlessly
    y.set(next);
  });

  if (items.length === 0) {
    return (
      <p className="mono text-[12px] uppercase tracking-[0.14em] text-[var(--t-muted)]">
        No certificates published yet.
      </p>
    );
  }

  return (
    <div
      className="relative h-[420px] overflow-hidden md:h-[480px]"
      style={{ WebkitMaskImage: MASK, maskImage: MASK }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <motion.div style={{ y }}>
        <div ref={groupRef}>
          {items.map((c) => (
            <CertificateCard key={c.id} cert={c} />
          ))}
        </div>
        <div aria-hidden>
          {items.map((c) => (
            <CertificateCard key={`${c.id}-dup`} cert={c} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/** One certificate card in the ticker. Wrapped in a link when linkUrl is set. */
function CertificateCard({ cert }: { cert: Certificate }) {
  const inner = (
    <div className="group mb-3 grid grid-cols-[72px_1fr_auto] items-center gap-4 border border-[var(--line-box)] px-4 py-4 transition-colors hover:bg-[var(--accent-hover)]">
      <span className="relative h-[52px] w-[72px] overflow-hidden border border-[var(--line-box)]">
        {cert.coverUrl ? (
          <Image src={cert.coverUrl} alt={cert.title} fill sizes="72px" className="object-cover" />
        ) : (
          <span className="mono absolute inset-0 grid place-items-center text-[9px] uppercase tracking-[0.14em] text-[var(--t-muted)]">
            {cert.year}
          </span>
        )}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[16px] font-bold tracking-[-0.03em] text-white">
          {cert.title}
          {cert.linkUrl && <span className="mono ml-2 text-[11px] text-accent">↗</span>}
        </span>
        <span className="mono mt-1 block truncate text-[10px] uppercase tracking-[0.14em] text-[var(--t-label)]">
          {cert.venue}
        </span>
      </span>
      <span className="mono text-[13px] text-[var(--t-muted)]">{cert.year}</span>
    </div>
  );
  if (!cert.linkUrl) return inner;
  return (
    <a href={cert.linkUrl} target="_blank" rel="noopener noreferrer" className="block">
      {inner}
    </a>
  );
}
