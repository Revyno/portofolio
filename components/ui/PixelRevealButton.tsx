"use client";

import { useEffect, useMemo, useRef, useState, type ButtonHTMLAttributes } from "react";

/**
 * PixelRevealButton — retro "pixel reveal" CTA.
 *
 * On hover/focus the background morphs colorFrom → colorTo, but the fill appears
 * as a grid of small squares that pop in at RANDOM staggered delays (mosaic),
 * then reverse on leave. In `always` mode the pixels twinkle forever.
 *
 * Performance: the reveal is pure CSS (:hover + per-cell transition-delay), so
 * hovering triggers NO React re-render. Cells are only (re)built when the button
 * is resized. Everything animates opacity only → cheap, GPU-friendly.
 *
 * Example:
 *   <PixelRevealButton text="Get Started" colorFrom="#0b0b0b" colorTo="#4ce0ff" />
 *   <PixelRevealButton text="Live" triggerMode="always" pixelSize={8} />
 */

type TriggerMode = "hover" | "always";

interface PixelRevealButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Label text (kept on the top layer, always readable). */
  text: string;
  /** "hover" reveals on hover/focus; "always" loops the pixels forever. */
  triggerMode?: TriggerMode;
  /** Size of each pixel cell in px. */
  pixelSize?: number;
  /** Base background color (state A). */
  colorFrom?: string;
  /** Revealed background color (state B). */
  colorTo?: string;
  /** Text color. */
  textColor?: string;
  /** Corner radius in px. */
  radius?: number;
  /** Total reveal duration in ms (per-cell transition + random stagger window). */
  duration?: number;
  /** Loop duration per pixel for triggerMode="always" (defaults to `duration`). */
  animationSpeed?: number;
}

/** Deterministic-per-mount random delays, one per cell, in [0, spread] ms. */
function makeDelays(count: number, spread: number): number[] {
  return Array.from({ length: count }, () => Math.round(Math.random() * spread));
}

export function PixelRevealButton({
  text,
  triggerMode = "hover",
  pixelSize = 10,
  colorFrom = "#0b0b0b",
  colorTo = "#4ce0ff",
  textColor = "#ffffff",
  radius = 14,
  duration = 600,
  animationSpeed,
  className = "",
  style,
  ...rest
}: PixelRevealButtonProps) {
  const rootRef = useRef<HTMLButtonElement>(null);
  const [grid, setGrid] = useState({ cols: 0, rows: 0 });

  // Measure the button and derive the pixel grid. Rebuilds only on resize.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const { width, height } = el.getBoundingClientRect();
      setGrid({
        cols: Math.max(1, Math.ceil(width / pixelSize)),
        rows: Math.max(1, Math.ceil(height / pixelSize)),
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [pixelSize]);

  const count = grid.cols * grid.rows;
  // Random stagger — regenerated only when the cell count changes (not per hover).
  const perCellTransition = Math.max(60, Math.round(duration * 0.35));
  const delays = useMemo(
    () => makeDelays(count, Math.max(0, duration - perCellTransition)),
    [count, duration, perCellTransition],
  );

  const loop = animationSpeed ?? duration;

  return (
    <button
      ref={rootRef}
      type="button"
      className={`prb-root${triggerMode === "always" ? " prb-root--always" : ""} ${className}`}
      style={
        {
          "--prb-from": colorFrom,
          "--prb-to": colorTo,
          "--prb-radius": `${radius}px`,
          "--prb-dur": `${perCellTransition}ms`,
          "--prb-loop": `${loop}ms`,
          color: textColor,
          background: colorFrom,
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      {/* pixel grid overlay — decorative, clipped to the rounded corners */}
      <span
        aria-hidden
        className="prb-grid"
        style={{
          gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
          gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
        }}
      >
        {delays.map((d, i) => (
          <span
            key={i}
            className="prb-cell"
            style={{ "--prb-delay": `${d}ms` } as React.CSSProperties}
          />
        ))}
      </span>

      <span className="prb-label">{text}</span>

      {/* Scoped styles — reveal is CSS-only so hovering never re-renders React. */}
      <style>{`
        .prb-root {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          border-radius: var(--prb-radius, 14px);
          padding: 12px 28px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.14);
          -webkit-tap-highlight-color: transparent;
        }
        .prb-root:focus-visible {
          outline: 2px solid var(--prb-to);
          outline-offset: 2px;
        }
        .prb-grid {
          position: absolute;
          inset: 0;
          display: grid;
          border-radius: inherit;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }
        .prb-cell {
          background: var(--prb-to);
          opacity: 0;
          transition: opacity var(--prb-dur) ease var(--prb-delay);
          will-change: opacity;
        }
        /* hover / keyboard-focus reveal — random per-cell delay = mosaic in,
           reverse (mirrored) on leave. No JS involved. */
        .prb-root:hover .prb-cell,
        .prb-root:focus-visible .prb-cell {
          opacity: 1;
        }
        /* always mode: each pixel twinkles forever at its own offset */
        .prb-root--always .prb-cell {
          animation: prb-pulse var(--prb-loop) steps(1) var(--prb-delay) infinite alternate;
        }
        @keyframes prb-pulse { to { opacity: 1; } }
        .prb-label {
          position: relative;
          z-index: 1;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
        }
        @media (prefers-reduced-motion: reduce) {
          .prb-cell { transition: none; animation: none; }
        }
      `}</style>
    </button>
  );
}

export default PixelRevealButton;
