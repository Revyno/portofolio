"use client";

import { useEffect, useRef, useState } from "react";
import SpecularButton from "@/components/ui/SpecularButton";
import { playClick } from "@/lib/sound";

// Single-page: every item is an in-page anchor. Prefixed with "/" so the links
// also work from /projects/[slug] (route home, then jump to the section).
const ITEMS = [
  { id: "home", label: "Home" },
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
  { id: "journey", label: "Journey" },
];
const SECTION_IDS = [...ITEMS.map((i) => i.id), "contact"];

/** Scroll-spy: the section whose middle band sits under the viewport centre wins. */
function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(",")]);
  return active;
}

/**
 * Reading progress across the whole page — empty at the hero, full at the
 * footer. Sits above the nav so it reads whether the bar is transparent or not.
 *
 * A plain scroll listener rather than a ScrollTrigger scrub: this is a readout
 * of scroll position, not an animation, so it should track the scrollbar
 * exactly and keep working when the rAF ticker every GSAP tween depends on is
 * throttled — a background tab, or a tab the browser has stopped painting.
 * That also means it needs no reduce-motion branch.
 *
 * The page height is measured per event rather than cached. Caching it and
 * refreshing on resize/ResizeObserver looks cheaper, but both of those are
 * delivered through the rendering loop, so a cached height goes stale in
 * exactly the throttled case this avoids GSAP for — and a stale height that is
 * too large means the bar never reaches the end. scrollHeight is a cached read
 * while nothing has dirtied layout, which is the case during plain scrolling.
 */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const doc = document.documentElement;

    const paint = () => {
      const max = doc.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      el.style.transform = `scaleX(${progress})`;
    };

    paint();
    window.addEventListener("scroll", paint, { passive: true });
    window.addEventListener("resize", paint);
    return () => {
      window.removeEventListener("scroll", paint);
      window.removeEventListener("resize", paint);
    };
  }, []);

  return (
    <div className="scroll-progress" aria-hidden>
      <div ref={ref} className="scroll-progress-bar" />
    </div>
  );
}

/** Smooth-scroll to a section if present on this page; else route home to it. */
function goToSection(id: string) {
  playClick();
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  else window.location.assign(`/#${id}`);
}

/** Desktop top nav — mono items, active = 2px accent underline, Contact = fill button. */
export function Nav() {
  const active = useActiveSection(SECTION_IDS);
  const contactActive = active === "contact";
  return (
    // Fully transparent, no rule, no blur: the nav rides whatever is behind it
    // instead of sitting in its own bar. Nothing is painted here, so nothing
    // separates the labels from the content scrolling under them — the hero
    // plate's top scrim covers that at the top of the page, but further down
    // the sections have no such band. A `bg-gradient-to-b from-s0` on this
    // element restores legibility without bringing back a visible bar.
    <header className="sticky top-0 z-40 hidden md:block">
      <nav className="mx-auto flex h-[70px] max-w-[1440px] items-center justify-between px-[72px]">
        <a
          href="/#home"
          onClick={(e) => { e.preventDefault(); goToSection("home"); }}
          className="mono text-[13px] font-medium tracking-[0.14em] text-white"
        >
          Revellio
        </a>
        <ul className="mono flex items-center gap-9 text-[11px] font-medium uppercase tracking-[0.14em]">
          {ITEMS.map((it) => {
            const isActive = active === it.id;
            return (
              <li key={it.id}>
                <a
                  href={`/#${it.id}`}
                  onClick={(e) => { e.preventDefault(); goToSection(it.id); }}
                  className={`pb-1 transition-colors ${
                    isActive
                      ? "border-b-2 border-accent text-white"
                      : "border-b-2 border-transparent text-[var(--t-muted)] hover:text-white"
                  }`}
                >
                  {it.label}
                </a>
              </li>
            );
          })}
          <li>
            <SpecularButton
              size="sm"
              radius={0}
              autoAnimate={contactActive}
              onClick={() => goToSection("contact")}
              aria-current={contactActive ? "page" : undefined}
              lineColor="#4ce0ff"
              baseColor="#0b0b0b"
              textColor={contactActive ? "#4ce0ff" : "#ffffff"}
              className="mono uppercase tracking-[0.14em] !text-[11px]"
            >
              Contact
            </SpecularButton>
          </li>
        </ul>
      </nav>
    </header>
  );
}

/** Mobile sticky tab bar — 5 columns, 2px indicator on top of active. */
export function MobileTabBar() {
  const active = useActiveSection(SECTION_IDS);
  const tabs = [...ITEMS, { id: "contact", label: "Contact" }];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-[var(--line)] bg-s0/95 backdrop-blur md:hidden">
      {tabs.map((it) => {
        const isActive = active === it.id;
        return (
          <a
            key={it.id}
            href={`/#${it.id}`}
            onClick={(e) => { e.preventDefault(); goToSection(it.id); }}
            className={`mono flex min-h-[52px] flex-col items-center justify-center gap-1 border-t-2 px-1 py-[14px] text-[9.5px] uppercase tracking-[0.14em] ${
              isActive ? "border-accent text-white" : "border-transparent text-[var(--t-muted)]"
            }`}
          >
            {it.label}
          </a>
        );
      })}
    </nav>
  );
}
