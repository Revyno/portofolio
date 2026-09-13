"use client";

import type { ReactNode } from "react";
import { Nav, MobileTabBar, ScrollProgress } from "./Nav";
import { Shell } from "./primitives";
import { useProfile } from "@/lib/store";
import { ArtPlate } from "./ArtPlate";
import { MaskReveal, RuleDraw } from "./motion";
import { PLATES } from "./plates";


/** Expressive break — one per Home/Contact: outlined 45° box escaping the frame edge. */
export function DiagonalBreak({ side = "right" }: { side?: "left" | "right" }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute top-1/2 hidden h-[420px] w-[420px] -translate-y-1/2 rotate-45 border diag-hatch md:block ${
        side === "right" ? "-right-[180px]" : "-left-[180px]"
      }`}
      style={{ borderColor: "var(--accent-22)" }}
    />
  );
}

export function Footer({ plate = true }: { plate?: boolean }) {
  const profile = useProfile();
  const linkedin = profile.linkedin?.startsWith("http") ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin ?? ""}`;
  return (
    <footer className="relative overflow-hidden">
      {/* Own plate only when the footer stands alone (case-study pages). On the
          landing page PageChrome draws one plate across Contact + footer. */}
      {plate && (
        <ArtPlate
          src={PLATES.footer.src}
          focal={PLATES.footer.focal}
          focalMobile={PLATES.footer.focalMobile}
          scrim={0.86}
          evenScrim
          mode="reveal"
        />
      )}
      <RuleDraw className="absolute inset-x-0 top-0 z-10" />
      {/* Muted 0.45 white dissolves over a painting — the link row steps up to soft. */}
      <MaskReveal className="relative z-10">
        <Shell className="flex flex-col gap-4 py-10 md:flex-row md:items-center md:justify-between md:py-16">
          <div className="mono text-[10px] uppercase tracking-[0.16em] text-[var(--t-soft)]">
            {/* add years dinamic */}
            <p data-mask> @ {new Date().getFullYear()} Revellio </p>
          </div>
          <div className="mono flex gap-6 text-[10px] uppercase tracking-[0.16em] text-[var(--t-soft)]">
            <a data-mask href={linkedin} target="_blank" rel="noreferrer" className="hover:text-white">
              LinkedIn ↗
            </a>
            <a data-mask href={profile.github} target="_blank" rel="noreferrer" className="hover:text-white">
              GitHub ↗
            </a>
            <a data-mask href="https://gitlab.com/Revyno" target="_blank" rel="noreferrer" className="hover:text-white">
              Gitlab ↗
            </a>
            {/* <a data-mask href="https://wa.me/6281248608150" target="_blank" rel="noreferrer" className="hover:text-white">
              Whatsapp ↗
            </a> */}
          </div>
        </Shell>
      </MaskReveal>
    </footer>
  );
}

/**
 * Standard public page wrapper: nav + content + footer + mobile tab bar.
 *
 * `closing` is the last section of the page (Contact on the landing page). It
 * is rendered inside the same plate container as the footer so the fresco runs
 * unbroken from "Let's talk" down to the final link — two stacked plates would
 * show a seam wherever the sections meet. The trade: that section sits outside
 * <main>. Pages that don't pass it get a self-contained footer plate instead.
 */
export function PageChrome({ children, closing }: { children: ReactNode; closing?: ReactNode }) {
  return (
    <div className="min-h-dvh pb-[52px] md:pb-0">
      <ScrollProgress />
      <Nav />
      {/* Opaque and above: this is the layer that slides up off the closing
          panel. Transparent here and the parked panel shows through it instead
          of being uncovered. */}
      <main className="relative z-10 bg-s0">{children}</main>
      {closing ? (
        // One plate across the panel and the footer, parked at the bottom of the
        // viewport and uncovered as the page slides off it — the closing
        // counterpart to the pinned hero. Desktop only: on a phone the fixed tab
        // bar owns the bottom edge, and the panel does not fit the screen.
        <div className="relative overflow-hidden md:sticky md:bottom-0 md:z-0">
          <ArtPlate
            src={PLATES.footer.src}
            focal={PLATES.footer.focal}
            focalMobile={PLATES.footer.focalMobile}
            scrim={0.86}
            evenScrim
            mode="reveal"
          />
          <div className="relative z-10">
            {closing}
            <Footer plate={false} />
          </div>
        </div>
      ) : (
        <Footer />
      )}
      <MobileTabBar />
    </div>
  );
}
