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
import { gsap, ScrollTrigger, SplitText, reduced, isMobile } from "./gsap";
import { onVeilDone } from "./veil";

/** Headline: split into words, rise + fade in on mount. */
export function SplitReveal({
  children,
  as: Tag = "h1",
  className = "",
  delay = 0,
  hold = false,
}: {
  children: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  /** Wait for the intro curtain to clear. Without it the words rise unseen. */
  hold?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    let split: SplitText | null = null;

    // Once the headline has been revealed it stays revealed. A gsap.context
    // revert — StrictMode's double-invoke in dev, or Fast Refresh — restores
    // whatever inline opacity it recorded mid-tween and used to leave the hero
    // headline stuck part-faded. Classes are outside gsap's bookkeeping, and
    // .sr-shown carries !important so it also beats a restored inline value.
    const shown = () => {
      el.classList.remove("sr-hold");
      el.classList.add("sr-shown");
    };

    const run = () => {
      // Mobile: skip per-word SplitText. Splitting the clamped hero headline
      // reflows it on first paint and flashes the words at the top-left before
      // they rise — a plain fade is jump-free and reads the same at phone scale.
      // That fade is a CSS transition rather than a tween, and the class goes on
      // synchronously — effects run after paint, so the browser has already
      // painted .sr-hold and the transition still plays. Anything deferred to a
      // rAF or a tween can be throttled indefinitely in a background tab, which
      // would leave the headline invisible rather than merely un-animated.
      if (isMobile()) {
        shown();
        return;
      }
      el.classList.remove("sr-hold");
      split = new SplitText(el, { type: "words", wordsClass: "sr-word" });
      gsap.from(split.words, {
        yPercent: 115,
        opacity: 0,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.05,
        delay,
        clearProps: "opacity,transform",
        onComplete: shown,
      });
    };

    const cancel = hold ? onVeilDone(run) : (run(), () => {});
    return () => {
      cancel();
      split?.revert();
    };
  }, [children]);

  return (
    <Tag ref={ref} className={`sr-hold ${className}`}>
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
    // Mobile: per-line masks mutate the DOM and reflow — fade the whole block up.
    if (isMobile()) {
      gsap.fromTo(
        el,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration, ease: "expo.out", delay, scrollTrigger: { trigger: el, start, once: true } },
      );
      return;
    }
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
  delay = 0,
  hold = false,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  delay?: number;
  /** Above-the-fold block that belongs to the intro: wait for the curtain,
   *  then rise on a timer instead of on scroll. */
  hold?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el || reduced()) return;

    if (hold) {
      return onVeilDone(() => {
        gsap.from(el, { y, opacity: 0, duration: 0.7, ease: "power3.out", delay });
      });
    }

    // Blocks already on-screen at load were painted in place by SSR. gsap.from's
    // immediateRender yanks them to opacity:0/y before animating back — a visible
    // first-load jump on mobile. Only reveal-on-scroll for blocks below the fold.
    if (el.getBoundingClientRect().top < window.innerHeight) return;
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

/**
 * Group mask reveal: every `[data-mask]` descendant is wrapped in an
 * overflow-hidden span and rises from below, staggered. Unlike SplitReveal the
 * content is never hidden with opacity — if JS fails, the links still read.
 */
export function MaskReveal({
  children,
  className = "",
  delay = 0,
  stagger = 0.07,
  duration = 0.75,
  start = "top 90%",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
  start?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-mask]"));
    if (!items.length) return;

    // Mobile: same reason as LineReveal — wrapping each item mutates the DOM
    // and reflows the row. Fade the whole group instead.
    if (isMobile()) {
      gsap.from(el, {
        y: 20,
        opacity: 0,
        duration,
        ease: "power3.out",
        delay,
        scrollTrigger: { trigger: el, start, once: true },
      });
      return;
    }

    const masks = items.map((item) => {
      const mask = document.createElement("span");
      mask.className = "mr-mask";
      item.parentNode?.insertBefore(mask, item);
      mask.appendChild(item);
      return mask;
    });

    gsap.from(items, {
      yPercent: 115,
      duration,
      ease: "expo.out",
      stagger,
      delay,
      scrollTrigger: { trigger: el, start, once: true },
    });

    return () => {
      masks.forEach((mask) => {
        const item = mask.firstChild;
        if (item) mask.parentNode?.insertBefore(item, mask);
        mask.remove();
      });
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** A 1px rule that draws itself left-to-right when scrolled into view. */
export function RuleDraw({
  className = "",
  duration = 0.8,
  start = "top 92%",
}: {
  className?: string;
  duration?: number;
  start?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    gsap.from(el, {
      scaleX: 0,
      transformOrigin: "left center",
      duration,
      ease: "power3.inOut",
      scrollTrigger: { trigger: el, start, once: true },
    });
  }, []);

  return <span ref={ref} aria-hidden className={`block h-px w-full bg-[var(--line)] ${className}`} />;
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
