"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type MouseEvent,
} from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { playClick } from "@/lib/sound";

/**
 * PixelButton — Framer Motion pixel-reveal CTA, styled after the Framer
 * marketplace "Pixel Button". On hover/focus a grid of small squares pops in
 * with a staggered sweep to flood the button with its fill color, and the label
 * flips to the contrasting ink; it reverses on leave. Replaces the old React
 * Bits buttons (SpecularButton / StarBorder).
 *
 * Handles navigation itself (internal SPA push, external tab, data:/blob:
 * download) so it drops in for both <button> and link call sites. Honors
 * prefers-reduced-motion by cross-fading a single fill instead of the grid.
 */

type Size = "sm" | "md";
type Variant = "dark" | "accent";

const PALETTE: Record<Variant, { base: string; fill: string; ink: string; inkOn: string; border: string }> = {
  // near-black chip, cyan flood on hover
  dark: { base: "#0b0b0b", fill: "#4ce0ff", ink: "#ffffff", inkOn: "#0b0b0b", border: "rgba(76,224,255,0.35)" },
  // cyan chip, black flood on hover
  accent: { base: "#4ce0ff", fill: "#0b0b0b", ink: "#0b0b0b", inkOn: "#ffffff", border: "rgba(255,255,255,0.18)" },
};

const SIZES: Record<Size, string> = {
  sm: "text-[11px] px-[22px] py-[11px]",
  md: "text-[13px] px-[30px] py-[14px]",
};

const gridV: Variants = {
  rest: { transition: { staggerChildren: 0.004, staggerDirection: -1 } },
  on: { transition: { staggerChildren: 0.006 } },
};
const cellV: Variants = {
  rest: { opacity: 0, scale: 0.3 },
  // scale >1 so neighbouring cells overlap by a sub-pixel — closes the 1fr
  // grid-track seams that otherwise let the dark base bleed through the flood.
  on: { opacity: 1, scale: 1.08, transition: { duration: 0.18 } },
};

export interface PixelButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  size?: Size;
  variant?: Variant;
  /** Keep the fill flooded (touch devices, "current"/"sent" states). */
  active?: boolean;
  /** Edge length of each pixel cell, px. */
  pixelSize?: number;
  radius?: number;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  "aria-current"?: boolean | "page";
  "aria-expanded"?: boolean;
  tabIndex?: number;
}

export function PixelButton({
  children,
  href,
  onClick,
  type = "button",
  size = "md",
  variant = "dark",
  active = false,
  pixelSize = 12,
  radius = 0,
  disabled = false,
  className = "",
  ...aria
}: PixelButtonProps) {
  const router = useRouter();
  const ref = useRef<HTMLElement | null>(null);
  const [grid, setGrid] = useState({ cols: 0, rows: 0 });
  const [hot, setHot] = useState(false);
  const reduced = useReducedMotion();
  const pal = PALETTE[variant];
  const on = active || hot;

  // Derive the pixel grid from the rendered size; rebuild only on resize.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const { width, height } = el.getBoundingClientRect();
      setGrid({
        cols: Math.max(1, Math.round(width / pixelSize)),
        rows: Math.max(1, Math.round(height / pixelSize)),
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [pixelSize]);

  function activate(e: MouseEvent) {
    playClick();
    onClick?.();
    if (!href) return; // plain button / submit — let the native action run
    if (href.startsWith("data:") || href.startsWith("blob:")) return; // <a download> handles it
    if (!href.startsWith("/") && !href.startsWith("#")) return; // external — let the anchor navigate
    e.preventDefault(); // internal — SPA push, keep middle-click/new-tab working
    router.push(href);
  }

  const count = grid.cols * grid.rows;
  const className_ = `pb-root relative isolate inline-flex cursor-pointer select-none items-center justify-center overflow-hidden border font-medium leading-none outline-none transition-[opacity,transform] duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-[3px] ${SIZES[size]} ${className}`;
  const style = { background: pal.base, borderColor: pal.border, borderRadius: radius, outlineColor: pal.fill } as const;

  const inner = (
    <>
      {reduced ? (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          style={{ background: pal.fill, borderRadius: "inherit" }}
          initial={false}
          animate={{ opacity: on ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        />
      ) : (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 grid"
          style={{
            gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
            gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
            borderRadius: "inherit",
          }}
          variants={gridV}
          initial="rest"
          animate={on ? "on" : "rest"}
        >
          {Array.from({ length: count }, (_, i) => (
            <motion.span key={i} className="will-change-[opacity,transform]" style={{ background: pal.fill }} variants={cellV} />
          ))}
        </motion.span>
      )}
      <motion.span
        className="relative z-[1] mono inline-flex items-center gap-2 uppercase tracking-[0.14em]"
        initial={false}
        animate={{ color: on ? pal.inkOn : pal.ink }}
        transition={{ duration: 0.18 }}
        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.35)" }}
      >
        {children}
      </motion.span>
    </>
  );

  const motionProps = {
    className: className_,
    style,
    onHoverStart: () => setHot(true),
    onHoverEnd: () => setHot(false),
    onFocus: () => setHot(true),
    onBlur: () => setHot(false),
    onClick: activate,
    ...aria,
  } as const;

  // Anchor for real links (external tab / file download / crawlable internal).
  if (href) {
    const isFile = href.startsWith("data:") || href.startsWith("blob:");
    const external = !isFile && !href.startsWith("/") && !href.startsWith("#");
    return (
      <motion.a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        download={isFile ? "" : undefined}
        target={external && href.startsWith("http") ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        {...motionProps}
      >
        {inner}
      </motion.a>
    );
  }

  return (
    <motion.button ref={ref as React.Ref<HTMLButtonElement>} type={type} disabled={disabled} {...motionProps}>
      {inner}
    </motion.button>
  );
}

export default PixelButton;
