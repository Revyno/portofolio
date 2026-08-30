"use client";

/**
 * ArtPlate — a full-bleed painting behind a section, darkened until it reads as
 * texture rather than picture. Purely decorative: aria-hidden, no alt, never in
 * the reading order.
 *
 * Layering, outermost first — each transform gets its own element so the load
 * animation and the scroll scrub never fight over the same matrix:
 *   root   absolute fill, clips everything
 *   frame  clip-path wipe (mode="reveal")
 *   drift  scroll-scrubbed y + scale
 *   zoom   load push-in
 *   scrim  two-layer darkening, opacity scrubbed as the section leaves
 *   cols   hairline verticals (hero only), drawn downward on load
 */

import Image from "next/image";
import { useRef, useState, type CSSProperties } from "react";
import { useGSAP } from "./useGSAP";
import { gsap, reduced, isMobile } from "./gsap";
import { onVeilDone } from "./veil";

const COLUMNS = 5;

export function ArtPlate({
  src,
  focal = "50% 50%",
  focalMobile,
  scrim = 0.62,
  scrimEnd,
  columns = false,
  priority = false,
  mode = "scrub",
  evenScrim = false,
}: {
  src: string;
  focal?: string;
  focalMobile?: string;
  /** Darken evenly instead of leaning left — for plates that carry copy or a
   *  form across the full width rather than one block of display type. */
  evenScrim?: boolean;
  /** Resting scrim opacity — how far the painting is pushed under the type. */
  scrim?: number;
  /** Scrim opacity at the end of the scroll range. `mode="scrub"` only. */
  scrimEnd?: number;
  columns?: boolean;
  priority?: boolean;
  /**
   * "scrub"  — hero: pushes in on load, then drifts and darkens as it leaves.
   * "reveal" — footer: wipes up from the bottom edge when scrolled into view.
   */
  mode?: "scrub" | "reveal";
}) {
  const root = useRef<HTMLDivElement>(null);
  // The artwork is a static file that may not be in place yet (see the PRD's
  // fase 0). Fall back to a plain wash so the section never looks broken.
  const [broken, setBroken] = useState(false);

  useGSAP(() => {
    const el = root.current;
    if (!el || reduced()) return;
    const section = el.parentElement;
    const frame = el.querySelector<HTMLElement>(".plate-frame");
    const drift = el.querySelector<HTMLElement>(".plate-drift");
    const zoom = el.querySelector<HTMLElement>(".plate-zoom");
    const scrimEl = el.querySelector<HTMLElement>(".plate-scrim");
    if (!section || !frame || !drift || !zoom || !scrimEl) return;

    const phone = isMobile();

    if (mode === "reveal") {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: section, start: "top 90%", once: true },
      });
      tl.from(frame, { clipPath: "inset(100% 0% 0% 0%)", duration: 1.2, ease: "expo.out" })
        .from(zoom, { scale: 1.1, duration: 1.6, ease: "power2.out" }, 0);
      // Slow settle as the footer swings into view — off on phones, where the
      // scrub costs more than the 8% of drift it buys.
      if (!phone) {
        gsap.fromTo(
          drift,
          { yPercent: -8 },
          {
            yPercent: 0,
            ease: "none",
            scrollTrigger: { trigger: section, start: "top bottom", end: "bottom bottom", scrub: 0.8 },
          },
        );
      }
      return;
    }

    // Clip-path reveal: the plate opens from a centred band out to full bleed
    // while the image keeps pushing in behind it.
    //
    // Held until the loading screen clears. Running it on mount would spend the
    // entire reveal behind the curtain and the visitor would only ever see the
    // last few frames. The closed state lives in CSS (.plate-clip-in), not in a
    // gsap.set here — effects run after paint, so setting it in JS would show
    // one frame of the full plate and start the reveal with a visible snap.
    let intro: ReturnType<typeof gsap.timeline> | null = null;
    const stopWaiting = onVeilDone(() => {
      intro = gsap.timeline();
      intro
        .to(frame, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.out" })
        .from(zoom, { scale: 1.18, duration: 1.9, ease: "power2.out" }, 0);
      if (columns) {
        intro.from(
          el.querySelectorAll(".plate-col"),
          { scaleY: 0, transformOrigin: "top center", duration: 0.9, ease: "expo.out", stagger: 0.05 },
          0.55,
        );
      }
    });
    // The timeline is created outside the gsap.context (it is deferred past the
    // curtain), so the context cannot revert it — kill it by hand.
    const cleanup = () => {
      stopWaiting();
      intro?.kill();
    };

    if (phone) return cleanup;

    // Parallax lag: the painting drifts DOWN relative to the section, so it
    // moves up more slowly than the page and appears to trail the scroll. A
    // negative yPercent would do the opposite — pull the art up faster than the
    // content, which reads as the image escaping rather than following.
    // The +16% bleed on .plate-drift is what pays for this: translating down by
    // ~14% of the (taller) layer keeps its top edge above the frame, so no gap
    // opens at the top of the hero.
    const trigger = { trigger: section, start: "top top", end: "bottom top", scrub: 0.6 } as const;
    gsap.fromTo(drift, { yPercent: 0, scale: 1 }, { yPercent: 11, scale: 1.06, ease: "none", scrollTrigger: trigger });
    if (scrimEnd !== undefined) {
      gsap.fromTo(scrimEl, { opacity: scrim }, { opacity: scrimEnd, ease: "none", scrollTrigger: trigger });
    }

    return cleanup;
  }, [src, mode]);

  const focalVars = {
    "--focal": focal,
    "--focal-m": focalMobile ?? focal,
  } as CSSProperties;

  return (
    <div ref={root} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden select-none">
      {/* The closed clip is a class in scrub mode so it is already in the
          server-rendered markup — no frame of unclipped plate before the
          reveal. Reveal mode animates *from* a full-bleed inline value instead. */}
      <div
        className={`plate-frame absolute inset-0 ${mode === "scrub" ? "plate-clip-in" : ""}`}
        style={mode === "reveal" ? { clipPath: "inset(0%)" } : undefined}
      >
        {/* Vertical bleed, not inset-0: the drift layer has to be taller than
            the frame or translating it down exposes bare canvas at the top. */}
        <div className="plate-drift absolute inset-x-0 -inset-y-[16%]">
          <div className="plate-zoom absolute inset-0">
            {broken ? (
              <div className="plate-fallback absolute inset-0" />
            ) : (
              <Image
                src={src}
                alt=""
                fill
                priority={priority}
                loading={priority ? undefined : "lazy"}
                sizes="100vw"
                className="plate-img object-cover"
                style={focalVars}
                onError={() => setBroken(true)}
              />
            )}
          </div>
        </div>
      </div>
      <div
        className={`plate-scrim absolute inset-0 ${evenScrim ? "plate-scrim-even" : ""}`}
        style={{ opacity: scrim }}
      />
      {columns && (
        <div className="absolute inset-0 hidden md:block">
          {Array.from({ length: COLUMNS }, (_, i) => (
            <span
              key={i}
              className="plate-col"
              style={{ left: `${((i + 1) / (COLUMNS + 1)) * 100}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
