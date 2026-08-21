"use client";

import type { ReactNode } from "react";
import { Nav, MobileTabBar } from "./Nav";
import { Shell } from "./primitives";
import { Yesteryear } from "next/font/google";
import { useProfile } from "@/lib/store";


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

export function Footer() {
  const profile = useProfile();
  const linkedin = profile.linkedin?.startsWith("http") ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin ?? ""}`;
  return (
    <footer className="border-t border-[var(--line)]">
      <Shell className="flex flex-col gap-4 py-10 md:flex-row md:items-center md:justify-between">
        <div className="mono text-[10px] uppercase tracking-[0.16em] text-[var(--t-muted)]">
          {/* add years dinamic */}
          <p> @ {new Date().getFullYear()} Revellio </p>
        </div>
        <div className="mono flex gap-6 text-[10px] uppercase tracking-[0.16em] text-[var(--t-muted)]">
           <a href={linkedin} target="_blank" rel="noreferrer" className="hover:text-white">
            LinkedIn ↗
          </a>
          <a href={profile.github} target="_blank" rel="noreferrer" className="hover:text-white">
            GitHub ↗
          </a>
          <a href="https://gitlab.com/Revyno" target="_blank" rel="noreferrer" className="hover:text-white">
            Gitlab ↗
          </a>
          <a href="https://wa.me/6281248608150" target="_blank" rel="noreferrer" className="hover:text-white">
            Whatsapp ↗
          </a>
        </div>
      </Shell>
    </footer>
  );
}

/** Standard public page wrapper: nav + content + footer + mobile tab bar. */
export function PageChrome({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh pb-[52px] md:pb-0">
      <Nav />
      <main>{children}</main>
      <Footer />
      <MobileTabBar />
    </div>
  );
}
