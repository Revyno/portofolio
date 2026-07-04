"use client";

import { type ReactNode } from "react";

/* ---- NameTag: "revellio", tilted, top-left, click = back to menu ---- */
export function NameTag({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Back to main menu"
      className="fixed left-3 top-3 z-50 cursor-pointer border-none bg-[var(--p5-pure-white)] px-3 pb-0.5 pt-1.5 text-2xl text-[var(--p5-ink)] shadow-[4px_4px_0_var(--p5-red)] transition-transform duration-150 hover:scale-110 md:left-5 md:top-6 md:px-4 md:pb-1 md:pt-2 md:text-4xl"
      style={{
        fontFamily: "var(--font-display)",
        transform: "rotate(-18deg)",
        clipPath: "var(--clip-para)",
      }}
    >
      revellio<span className="text-[var(--p5-red)]">.</span>
    </button>
  );
}

/* ---- KeyHints: game-style control hints ---- */
export function KeyHints({ back = false }: { back?: boolean }) {
  return (
    <div className="p5-keyhints">
      {!back && (
        <span>
          <kbd>↑</kbd>
          <kbd>↓</kbd> NAVIGATE
        </span>
      )}
      {!back && (
        <span>
          <kbd>↵</kbd> CONFIRM
        </span>
      )}
      {back && (
        <span>
          <kbd>ESC</kbd> BACK
        </span>
      )}
      <span>
        <kbd>M</kbd> SOUND
      </span>
    </div>
  );
}

/* ---- AngledPanel ---- */
export function AngledPanel({
  children,
  variant = "light",
  className = "",
  rotate = 0,
  ...rest
}: {
  children: ReactNode;
  variant?: "light" | "dark" | "red";
  className?: string;
  rotate?: number;
} & React.HTMLAttributes<HTMLDivElement>) {
  const v = variant === "dark" ? "p5-panel--dark" : variant === "red" ? "p5-panel--red" : "";
  return (
    <div className={`p5-panel ${v} ${className}`} style={{ transform: `rotate(${rotate}deg)` }} {...rest}>
      {children}
    </div>
  );
}

/* ---- Tag ---- */
export function Tag({ children }: { children: ReactNode }) {
  return <span className="p5-tag">{children}</span>;
}

/* ---- StatusChip: TAG + value pair ---- */
export function StatusChip({ tag, value }: { tag: string; value: string }) {
  return (
    <span className="p5-chip text-lg">
      <b>{tag}</b> {value}
    </span>
  );
}

/* ---- RankBadge ---- */
export function RankBadge({ rank }: { rank: string }) {
  return <span className="p5-rank">{rank}</span>;
}

/* ---- ActionLink ---- */
export function ActionLink({
  label,
  sub,
  href,
  onHover,
}: {
  label: string;
  sub?: string;
  href: string;
  onHover?: () => void;
}) {
  return (
    <a
      className="p5-action"
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      onMouseEnter={onHover}
      onFocus={onHover}
    >
      <span className="p5-action-arrow">▶</span>
      <span>{label}</span>
      {sub && (
        <span className="ml-auto text-base tracking-wide opacity-70" style={{ fontFamily: "var(--font-body)" }}>
          {sub}
        </span>
      )}
    </a>
  );
}

/* ---- InfoBar: bottom HUD bar ---- */
export function InfoBar({ left, right }: { left: ReactNode; right?: ReactNode }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-3 bg-[var(--p5-ink)]/90 px-3 py-2 md:px-8">
      <div className="flex min-w-0 items-center gap-4">{left}</div>
      {right && <div className="hidden items-center gap-4 sm:flex">{right}</div>}
    </div>
  );
}
