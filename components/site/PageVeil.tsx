"use client";

/**
 * Intro loading screen — black field, "Revellio" drawn left-to-right in a
 * script face, then five panels lift the curtain off the hero. Runs once per
 * tab, on the landing page only, so the CMS, sign-in and case-study routes
 * never carry it.
 *
 * Two things are deliberately NOT done in JavaScript:
 *
 *  - The draw itself is a CSS animation that starts at parse time. A loading
 *    screen whose artwork waits for hydration is just a blank screen whose
 *    length is decided by the visitor's connection — the exact failure this
 *    replaces. GSAP only owns the exit, by which point JS is up anyway.
 *  - The decision to show at all is made by an inline boot script before first
 *    paint (see veil.ts), so repeat visits and reduce-motion never flash black.
 *
 * Exit timing follows readiness, not a fixed timer: it leaves as soon as the
 * page has loaded, held to a floor so the mark is never cut mid-stroke, and to
 * a ceiling so a slow asset can't hold the page hostage.
 */

import { useRef, useState } from "react";
import { useGSAP } from "./useGSAP";
import { gsap, ScrollTrigger, isMobile } from "./gsap";
import { markVeilDone, veilPending } from "./veil";

/**
 * The pen's motion through "Revellio", in the 680×340 viewBox. It only has to
 * sweep left-to-right and undulate the way a hand does — the mask stroke is
 * far thicker than the letters, so it covers them whatever their exact shape.
 * Monotonic in x on purpose: a path that doubled back would un-reveal letters.
 */
const WRITE_PATH =
  "M 35 178 C 90 156, 140 160, 175 185 C 208 208, 240 202, 268 176 " +
  "C 292 155, 320 158, 345 184 C 368 207, 395 202, 422 177 " +
  "C 448 156, 480 158, 508 182 C 535 205, 570 200, 600 180 " +
  "C 622 167, 635 165, 645 172";

const PANELS = 5;
/** Floor: the CSS stroke is 0.15s delay + 1.25s, so leaving sooner cuts the pen off. */
const MIN_MS = 1480;
/** Ceiling: stop waiting on `load` past this and go anyway. */
const MAX_MS = 3000;
/** Hard stop. Covers a backgrounded tab, where rAF and GSAP are throttled. */
const FAILSAFE_MS = 5000;

export function PageVeil() {
  const [alive, setAlive] = useState(true);
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = root.current;
    if (!el) return;

    // The boot script already decided. No `veil-on` → this load has no curtain.
    if (!veilPending()) {
      setAlive(false);
      return;
    }

    const timers: number[] = [];
    let spent = false;

    const finish = () => {
      if (spent) return;
      spent = true;
      timers.forEach(window.clearTimeout);
      markVeilDone();
      // Section offsets were measured under a locked scroll — remeasure so the
      // nav scroll-spy and anchor jumps stay honest.
      ScrollTrigger.refresh();
      setAlive(false);
    };

    let exited = false;
    const exit = () => {
      if (exited || spent) return;
      exited = true;
      // Nothing below is on screen any more; stop swallowing clicks.
      el.style.pointerEvents = "none";

      const tl = gsap.timeline({ onComplete: finish });
      tl.to(el.querySelector(".veil-stage"), {
        y: -20,
        opacity: 0,
        duration: 0.35,
        ease: "power2.in",
      });
      // Phone: panel choreography is invisible at this width and the extra
      // compositing costs more than it buys. One fade.
      if (isMobile()) {
        tl.to(el, { opacity: 0, duration: 0.45, ease: "power2.out" }, "-=0.1");
      } else {
        tl.to(
          el.querySelectorAll(".veil-panel"),
          { yPercent: -100, duration: 0.8, ease: "expo.inOut", stagger: 0.05 },
          "-=0.1",
        );
      }
    };

    const started = performance.now();
    const leaveWhenDrawn = () => {
      timers.push(window.setTimeout(exit, Math.max(0, MIN_MS - (performance.now() - started))));
    };

    if (document.readyState === "complete") leaveWhenDrawn();
    else window.addEventListener("load", leaveWhenDrawn, { once: true });
    timers.push(window.setTimeout(leaveWhenDrawn, MAX_MS));
    timers.push(window.setTimeout(finish, FAILSAFE_MS));

    return () => {
      timers.forEach(window.clearTimeout);
      window.removeEventListener("load", leaveWhenDrawn);
    };
  }, []);

  if (!alive) return null;

  return (
    <div ref={root} id="page-veil" className="veil" role="status">
      <div className="veil-panels" aria-hidden>
        {Array.from({ length: PANELS }, (_, i) => (
          <span key={i} className="veil-panel" />
        ))}
      </div>
      {/* The wordmark is written, not wiped. A thick stroke follows WRITE_PATH
          through the letters and is used as a mask, so the glyphs appear along
          the pen's motion rather than behind a straight vertical edge. The pen
          itself is the same path drawn as a single short dash that travels it
          — same path, same easing, so the nib sits exactly on the reveal edge
          without any JavaScript keeping the two in sync.

          One <text> node with an aria-label, so a screen reader says
          "Revellio" rather than spelling out per-letter spans. */}
      <span className="veil-stage">
        <svg className="veil-svg" viewBox="0 0 680 340" role="img" aria-label="Revellio">
          <defs>
            <mask id="veil-write-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="680" height="340">
              <path className="veil-write" d={WRITE_PATH} pathLength={1} />
            </mask>
          </defs>
          {/* textLength is 560 against a natural advance of 543 at this size —
              a 1.03× nudge, invisible to the eye. It is set at all only to keep
              the geometry deterministic: the mask has to line up with the
              letters even when the fallback cursive renders instead of
              Yesteryear. Wider values distort the letterforms. */}
          <text
            className="veil-word"
            x="340"
            y="235"
            textAnchor="middle"
            textLength="560"
            lengthAdjust="spacingAndGlyphs"
            mask="url(#veil-write-mask)"
          >
            Revellio
          </text>
          <path className="veil-pen" d={WRITE_PATH} pathLength={1} aria-hidden />
        </svg>
      </span>
    </div>
  );
}
