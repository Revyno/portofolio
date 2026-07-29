"use client";

/**
 * Minimal useGSAP — runs an effect inside a gsap.context (auto-reverts every
 * tween/ScrollTrigger it creates on cleanup) after paint. Stand-in for
 * @gsap/react, which isn't installed. ponytail: swap for @gsap/react if added.
 */
import { useEffect } from "react";
import { gsap } from "./gsap";

export function useGSAP(fn: () => void | (() => void), deps: unknown[] = []) {
  useEffect(() => {
    let cleanup: void | (() => void);
    const ctx = gsap.context(() => {
      cleanup = fn();
    });
    return () => {
      if (typeof cleanup === "function") cleanup();
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
