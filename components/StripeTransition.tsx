"use client";

import { useImperativeHandle, useRef, type Ref } from "react";
import gsap from "gsap";

export type StripeHandle = {
  /** Cover the screen with stripes, run `onCovered` while hidden, then reveal. */
  play: (onCovered: () => void) => void;
};

const STRIPE_COUNT = 8;

export function StripeTransition({ ref }: { ref: Ref<StripeHandle> }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    play(onCovered) {
      const stripes = rootRef.current?.children;
      if (!stripes || stripes.length === 0) {
        onCovered();
        return;
      }
      // Slide along the rotated container's Y axis — the container's own
      // rotation gives the diagonal look, so bands never open gaps.
      gsap
        .timeline()
        .set(stripes, { yPercent: -102 })
        .to(stripes, {
          yPercent: 0,
          duration: 0.32,
          ease: "power3.in",
          stagger: 0.04,
        })
        .add(onCovered)
        .to(
          stripes,
          {
            yPercent: 102,
            duration: 0.36,
            ease: "power3.out",
            stagger: 0.04,
          },
          "+=0.08"
        )
        .set(stripes, { yPercent: -102 });
    },
  }));

  return (
    <div ref={rootRef} className="p5-stripes" aria-hidden>
      {Array.from({ length: STRIPE_COUNT }, (_, i) => (
        <div key={i} className="p5-stripe" />
      ))}
    </div>
  );
}
