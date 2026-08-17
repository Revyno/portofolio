"use client";

/** Single GSAP entry point — registers plugins once, client-only. */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

/** Honors the OS "reduce motion" setting. */
export function reduced(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Phone-width viewport (< md). SplitText DOM surgery reflows on these — fade instead. */
export function isMobile(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 767px)").matches
  );
}

export { gsap, ScrollTrigger, SplitText };
