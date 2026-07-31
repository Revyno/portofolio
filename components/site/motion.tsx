"use client";

/**
 * GSAP motion helpers — SplitText word reveals + ScrollTrigger parallax/fade-up.
 * Kept subtle to stay within the Swiss system; all effects no-op under
 * prefers-reduced-motion. Plugins are registered once, client-only, so they
 * stay out of the server bundle.
 * ponytail: intentional deviation from DESIGN §6 (no-parallax) — requested.
 */

import { useRef, type ReactNode, type ElementType } from "react";
import { useGSAP } from "./useGSAP";
import { gsap, ScrollTrigger, SplitText, reduced } from "./gsap";

/** Headline: split into words, rise + fade in on mount. */
export function SplitReveal({
  children,
  as: Tag = "h1",
  className = "",
  delay = 0,
}: {
  children: string;
  as?: ElementType;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    const split = new SplitText(el, { type: "words", wordsClass: "sr-word" });
    gsap.set(el, { opacity: 1 });
    gsap.from(split.words, {
      yPercent: 115,
      opacity: 0,
      duration: 0.9,
      ease: "expo.out",
      stagger: 0.05,
      delay,
    });
    return () => split.revert();
  }, [children]);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{ opacity: reduced() ? 1 : 0 }}
    >
      {children}
    </Tag>
  );
}

/**
 * Line-mask reveal: splits text into lines, each wrapped in an
 * overflow:hidden mask, then rises each line from below on scroll-into-view.
 * Use for headlines, intros, or any block that should "type-rise" in.
 */
export function LineReveal({
  children,
  as: Tag = "div",
  className = "",
  delay = 0,
  stagger = 0.08,
  duration = 0.9,
  start = "top 85%",
}: {
  children: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
  start?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    const split = new SplitText(el, { type: "lines", linesClass: "lr-line" });
    // wrap each line in a mask div so the clip is per-line
    split.lines.forEach((line) => {
      const mask = document.createElement("div");
      mask.className = "lr-mask";
      line.parentNode?.insertBefore(mask, line);
      mask.appendChild(line);
    });
    gsap.set(el, { opacity: 1 });
    gsap.from(split.lines, {
      yPercent: 115,
      duration,
      ease: "expo.out",
      stagger,
      delay,
      scrollTrigger: { trigger: el, start, once: true },
    });
    return () => split.revert();
  }, [children]);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{ opacity: reduced() ? 1 : 0 }}
    >
      {children}
    </Tag>
  );
}

/** Fade-up a block when it scrolls into view. */
export function Reveal({
  children,
  className = "",
  y = 28,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    gsap.from(el, {
      y,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** Vertical parallax: element drifts as it passes through the viewport. */
export function Parallax({
  children,
  className = "",
  amount = 60,
}: {
  children: ReactNode;
  className?: string;
  amount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    gsap.to(el, {
      yPercent: -amount / 10,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export { ScrollTrigger };
